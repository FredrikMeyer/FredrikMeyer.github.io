---
layout: post
title: A topological space that is not first countable
date: 2020-12-14 07:58 +0100
---

Recently me and some friends were discussing [first countability](https://en.wikipedia.org/wiki/First-countable_space), and noticed that Wikipedia gave an example of space that was *not* first countable, but with no proof. So here's my attempt at a proof.

Let $X=\mathbb R / \mathbb N$, where we identify $1 \simeq 2 \simeq \ldots$. Geometrically, this space is an "infinite wedge product" of circles. It looks like a flower with a countable infinite number of "petals".

The open sets in $X$ are of two types: those containing $[1]$ (the equivalence class of $1 \in  X$), and those not containing $[1]$. The latter ones are just shorts intervals not containing any natural numbers. Let $\pi: \mathbb R \to X$ be the projection map. Note that if $[1] \in V$, then $\mathbb N \subset \pi^{-1}(V)$ (since $\pi^{-1}([1])=\mathbb N$, by definition of $X$). This implies that any open set in $X$ containing $[1]$ must intersect all petals (and so must be a union of intervals around each natural number).

# Proposition: $X$ is not first countable.

Recall that a space is first countable if every point $x \in X$ has a countable [neigbourhood basis](https://en.wikipedia.org/wiki/Neighbourhood_system#Basis). A neigbourhood basis is a collection of open subsets that is "arbitrarily small".

Note that we can consider a neigbourhood basis as indexed by the natural numbers, i.e. a function $f: \mathbb N \to \mathscr P(X)$. We will denote $f(i)$ by $N_i$, and its preimage in $\mathbb R$ by $N_i'$.

We will construct an open set $U \subset X$ such that $N_i \not \subset U$ for all $i$ given any proposed neigbourhood basis $\{ N_i \}$ around $[1]$.

For $N_1$, since $\mathbb N \subset N_1'$, we can find a small interval $I_1'$ in $\mathbb R$ around $1 \in \mathbb R$ strictly contained in $N_1'$ (make it small enough so that it doesn't intersect any other natural numbers).

We continue: choose a small interval $I_2'$ around $2 \in \mathbb R$ strictly contained in $N_2'$.

And so on... We define $U'$ by taking the union of all the $I_n'$'s. We denote its image in $X$ by $U$. Note that $U=\pi(U')$ is also open, since $\pi^{-1}(\pi(U))=U'$. Geometrically, $U$ looks like a small interval around every petal on $X$, made in such a way that $N_i \not \subset U$ for every $i$.

We conclude that $X$ cannot be first countable, since given any indexed collection of open subsets containing $[1] \in X$, we can find an open $U$ that is "too big".

# Comments

Note that this proof wouldn't work if we took a *finite* wedge product of circles, because then the countable neigbourhood basis could be big enough.

Also note that the technique in the proof is basically [Cantor's diagonal argument](https://en.wikipedia.org/wiki/Cantor%27s_diagonal_argument).
