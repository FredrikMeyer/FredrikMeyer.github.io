---
layout: post
title: How to connect to localhost from a Docker container
date: 2021-08-23 22:03 +0200
tags: programming
---

At work I recently spent *a lot* of time trying to get a running Docker container to connect to a service running on `localhost`.

The setup is this: we have a Docker container that runs inside a Docker [bridge network](https://docs.docker.com/network/bridge/) together with other Docker containers it can communicate with. On the host machine there is a service which listens on `127.0.0.1:8088`. For the purposes of this blog post, let's just assume this service's job is to stream messages to some server.

I wanted one of the containers to connect to the service running on `localhost`. In this post I will explain how I got it to work (only on Linux).

The picture is something like this:

![Docker Bridge Network](/assets/localhost_docker.png)

Docker containers inside the same bridge network can easily communicate with each other by using their container ID as the host name.

However, Docker Container A cannot easily talk to something on `localhost` on the host machine. There is even someone on [StackOverflow](https://stackoverflow.com/questions/24319662/from-inside-of-a-docker-container-how-do-i-connect-to-the-localhost-of-the-mach#comment109410097_24319662) saying that this is not possible!

> Without network: host you can't go back from a container to the host. Only host to container. This is the main ideology behind containers. They are isolated for both stability and security reasons.

This is a truth with modifications. The way Docker manages its networking is [by suitably modifying](https://docs.docker.com/network/iptables/) `iptables`. Which means that we also can do the same!

We are going to use `iptables` to route traffic to the bridge gateway inside a container to traffic on `localhost` on the host machine (the next steps are thanks to [this](https://stackoverflow.com/a/57833573/1013553) very helpful StackOverflow answer). The IP of the bridge gateway can be found by running `docker network inspect <bridge name>`. To not have to worry about the actual IP, you can start the container with `--add-host host.docker.internal:host-gateway`. This will map the host name `host.docker.internal` to the IP of the bridge gateway.

First we have to find the name of the Docker bridge network. This is not the same as the ID you see when you do `docker network ls`, but almost. If you use the default bridge network, then the name should be `bridge`. If you made your own network, the name will be `br-<first 12 chars of network ID>` (see the [original code](https://github.com/moby/libnetwork/blob/b3507428be5b458cb0e2b4086b13531fb0706e46/drivers/bridge/bridge.go#L551)). You can also get the name of the bridge by running `ifconfig`.

You can set the bridge name yourself when you create the network with the following command ([source](https://stackoverflow.com/a/43981857/1013553)): (just remember that it can be at most 15 characters long)

```
docker network create --opt com.docker.network.bridge.name=<my_name> test-net
```

We need to allow routing from the bridge to localhost:

```
sysctl -w net.ipv4.conf.<bridge_name>.route_localnet=1
```

Note that this has some [mild security implications](https://security.stackexchange.com/questions/137602/what-are-the-security-implications-of-net-ipv4-conf-eth0-route-localnet-1-rout).

The next step is to use `iptables` to forward traffic to the bridge gateway to localhost.

```
iptables -t nat -A PREROUTING -p tcp -i <bridge-name> --dport 8088 -j DNAT --to-destination 127.0.0.1:8088
```

Once this is done, you can connect to the service on `localhost` on the host machine by calling `host.docker.internal:8088`.

Happy coding!
