---
layout: post
title: Estimating Pi with Kafka Streams
date: 2024-05-06 12:48 +0200
tags: programming math
---

Recently I wanted to learn a bit about Apache Kafka. It is often used as a way to do event sourcing (or similar message-driven architectures). A "add-on" to the simple publish/subscribe pattern in Kafka is _Kafka Streams_, which provides ways to process unbounded data sets.

I wanted to write something slightly more complicated than the examples in the Kafka documentation.

## Estimating π (Pi) by throwing darts

![Circle inside square](/assets/circle_inside_square.png){: style="float: right; width:25vw"} Back in the day we all learned the formula $A=\pi r^2$ for the area of a circle. We place the circle of radius 1 inside the unit square $[-1,1]^2$ (see the picture). The unit square has area $2 \times 2 = 4$, so the circle covers $\pi^2 \cdot 1^2/4=\pi/4 \approx 0.7853$ of it.

One (silly, very bad) way to estimate the area of the circle is to sample random points inside the square, and count how many of them land inside the circle. We end up with this formula:

\[
\lim_{n \to \infty} \frac{ \\#\( \text{hits inside the circle} \)}{n} = \large\pi
\]


We need two ingredients to estimate Pi this way:
 - A way of generating (pseudo-)random numbers (which any normal computer can do).
 - A way to decide if a given point is inside the circle.

To decide if a given point is inside a circle, we just check that its absolute value is less than one:

\[
(x,y) \mapsto x^2+y^2 \leq 1
\]

We realize now that this algorithm can be implemented in [25 lines of Python](https://gist.github.com/FredrikMeyer/1099aa6791e272d85b65cd33a53899a6) (with plenty of spacing), but let us use our skills as engineers to over-engineer instead.


## Implementation in Kafka

Glossing over details, Kafka consists of topics and messages. Clients can publish and subscribe to these topics. It also promises "high throughput", "scalability", and "high availability". Since I'm doing this on my laptop, none of this applies.

Kafka Streams is a framework for working with the Kafka messages as a stream of events, and provides utilities for real time aggregation.

Below is a high-level overview of the Kafka streams topology:

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

We produce a stream of random pairs of numbers to a Kafka topic `randoms`. Then, in the aggregate step, we use a state store to keep track of the numbers of hits so far (together with the total number of random points processed).

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

We consume input from `randoms` topic (making it into a stream). Then we use the `getPiEstimationStream` method to calculate a running estimation of π. Finally, we output the estimation to a Kafka topic `pi-estimation`. We also output the relative error to another topic.

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

I also set up a simple Javalin app that publishes the messages via websockets to localhost.

## Demo

