---
layout: post
title: Estimating Pi with Kafka Streams
date: 2024-05-06 12:48 +0200
tags: programming math
---

Recently I wanted to learn a bit about [Apache Kafka](https://kafka.apache.org/). It is often used as a way to do event sourcing (or similar message-driven architectures). An "add-on" to the simple publish/subscribe pattern in Kafka is _Kafka Streams_, which provides ways to process unbounded data sets.

I wanted to write something slightly more complicated than the examples in the Kafka documentation.

## Estimating π (Pi) by throwing darts

![Circle inside square](/assets/circle_inside_square.png){: style="float: right; width:25vw"} Back in the day we all learned the formula $A=\pi r^2$ for the area of a circle. We place the circle of radius 1 inside the unit square $[-1,1]^2$ (see the picture). The unit square has an area of $2 \times 2 = 4$, so the area of the circle is $\pi \cdot r^2 = \pi \cdot 1^2 = \pi$. The circle covers $\pi / 4 \approx 0.7853$ of the square's area.

One (silly, [very bad](https://ocw.mit.edu/courses/2-086-numerical-computation-for-mechanical-engineers-fall-2014/30d8b5da0c8e6ad44987b3563bc32dab_MIT2_086F14_Monte_Carlo.pdf)) way to estimate the area of the circle is to sample random points inside the square, and count how many of them land inside the circle. We end up with this formula:

$$
\lim_{n \to \infty} \frac{ \#\left( \text{hits inside the circle} \right)}{n} = \large\pi
$$


We need two ingredients to estimate Pi this way:
 - A way of generating (pseudo-)random numbers (which any normal computer can do).
 - A way to decide if a given point is inside the circle.

To decide if a given point is inside a circle, we just check that its absolute value is less than one:

$$
(x,y) \mapsto x^2+y^2 \leq 1
$$

We realize now that this algorithm can be implemented in [25 lines of Python](https://gist.github.com/FredrikMeyer/1099aa6791e272d85b65cd33a53899a6) (with plenty of spacing), but let us use our skills as engineers to over-engineer instead.


## Implementation in Kafka

Glossing over details, Kafka consists of topics and messages. Clients can publish and subscribe to these topics. It also promises "high throughput", "scalability", and "high availability". Since I'm doing this on my laptop, none of this applies.

[Kafka Streams](https://kafka.apache.org/documentation/streams/) is a framework for working with the Kafka messages as a stream of events, and provides utilities for real time aggregation.

Below is a high-level overview of the Kafka streams topology that we will build:

<div style="text-align: center">
{% plantuml %}
left to right direction
entity "Produces pairs of\nrandom numbers" as Source
process "Aggregate " as Processor
entity "Pi estimation" as Sink1
entity "Estimation error" as Sink2

database "State Store" as Store

Source --> Processor
Processor <-> Store
Processor --> Sink1
Processor --> Sink2
{% endplantuml %}
</div>

We produce a stream of random pairs of numbers to a Kafka topic named `randoms`. Then, in the aggregate step, we use a state store to keep track of the numbers of hits so far (together with the total number of random points processed).

The code to build the topology is quite simple:

```java
public static Topology getTopology() {
    final StreamsBuilder builder = new StreamsBuilder();

    var randoms = builder.stream(TOPIC_RANDOMS,
                                 Consumed.with(Serdes.String(),
                                 new Tuple.TupleSerde()));

    KStream<String, Double> fractionStream = getPiEstimationStream(randoms);

    // Output result to a topic
    fractionStream.to(TOPIC_PI_ESTIMATION,
                     Produced.with(Serdes.String(), Serdes.Double()));

    // Also make a topic with the error
    fractionStream.mapValues(v -> Math.abs(Math.PI - v) / Math.PI)
                 .to(TOPIC_PI_ERROR,
                     Produced.with(Serdes.String(), Serdes.Double()));

    return builder.build();
}
```

We consume input from the `randoms` topic (making it into a stream). Then we use the `getPiEstimationStream` method to calculate a running estimation of π. Finally, we output the estimation to the Kafka topic `pi-estimation`. We also output the relative error to another topic.

The code for calculating the estimate is also quite short:

```java
private static KStream<String, Double> getPiEstimationStream(KStream<String, Tuple> stream) {
    var fractionStore = Materialized
                          .<String, FractionAggregator>as(Stores.persistentKeyValueStore("average-store"))
                          .withValueSerde(new FractionAggregator.FractionAggregatorSerde());

    return stream
            .mapValues(Tuple::insideCircle) // Map Tuple to boolean
            .groupByKey()
            .aggregate(() -> new FractionAggregator(0, 0),
                       (key, value, agg) -> FractionAggregator.aggregate(
                               agg,
                               value ? 1 : 0),
                       fractionStore)
            .toStream()
            .mapValues(PiEstimationTopology::getEstimate);
}

private static double getEstimate(FractionAggregator fractionAggregator) {
    return fractionAggregator.total() == 0
            ? 0
            : 4. * fractionAggregator.trues() / fractionAggregator.total();
}
```

The `FractionAggregator` class is just a simple Java record that keeps track of the total number of messages consumed, and how many landed inside the circle.

I also set up a simple Javalin app that publishes the messages via websockets to localhost. To do this, one writes a Kafka consumer for each topic, and use a standard `consumer.poll` loop. Then I used µPlot to continuously update the current estimate.

## Demo

As always, I put my code [on Github](https://github.com/FredrikMeyer/kafka-pi). To run the project, first start Kafka (for example with `docker run -it --rm -p 9092:9092 apache/kafka:3.7.0`), and then run `mvn exec:java` to run the project. Open your browser on `localhost:8081`, and start seeing estimations come in.

Below is a screen recording I did.

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/XKtQzVqFHGw?si=jUca7rMDKZ_TDiay" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## What I learned

Even though this little project was embarrassingly simple, I learned more than just the Kafka Java API.

###  Maybe write tests earlier

I decided to also write tests, mostly to increase my own learning. For example, writing the tests for the stream topology (see [source here](https://github.com/FredrikMeyer/kafka-pi/blob/ca5342a1aa219a18de8bc093b07d4a8d77142566/src/test/java/net/fredrikmeyer/kafkapi/PiEstimationTopologyTest.java)), made me realize that the topology is completely stateless. It is just a specification of inputs, transformations, and outputs.

If I had written the tests earlier, I would have avoided having to restart the Kafka container again and again.

### Documentation of test utilities

I spent an awful lot of time writing the single test I have for the `EstimationConsumer` class. It uses Kafka's [`MockConsumer`](https://kafka.apache.org/26/javadoc/org/apache/kafka/clients/consumer/MockConsumer.html) class to mock a consumer. The only documentation I could find of this class were some examples on [Baeldung's pages](https://www.baeldung.com/kafka-mockconsumer).

(in general, I find that documentation for "beginners" is often too basic, outdated, or lacking)

### Kafka not as fast as I thought (locally)

The first thing I tried when I started exploring Kafka, was to publish a message on some topic, and subscribe to the same topic in another terminal. About one second later, I got the message. I was a bit surprised that I wouldn't see the message immediately, but when meditating on this for a little while, I realized that there is a _difference between latecy and throughput_.

There is also tons of configuration that I did not explore.

### Serialization can be complicated

I chose to not take serialization seriously, so I just used Java's built-in serialization interface (using `implements Serializable`). This is of course fine for testing applications, but it turned out to be cumbersome when I changed the classes involved. The solution was usually to delete and restart the Kafka container.

In a real application one would rather use a serialization method that don't crash on schema changes (Protobuf, Avro, JSON, ...). Also, one must be mindful about what to do with invalid messages. The default is to crash if any message is invalid.

There is even a whole chapter about this in the book [Designing Data-Intensive Applications](https://dataintensive.net/) (Chapter 4).

## Fin

Take a look at the code, and if I you found any errors here, don't hesitate to [contact me](https://github.com/FredrikMeyer/kafka-pi/issues).
