---
layout: post
title:  "The knapsack problem"
date:   2017-12-31 17:09:05 +0100
categories: mathematics discrete-optimization knapsack
---

This is my summary of lectures on the Knapsack Problem from the "Discrete Optimization" course on Coursera. 

Given a kapacity K and a set of n items with weights \\( w_i \\) and values \\( v_i \\), we want to maximize

$$  \sum_{i=1}^n v_i x_i $$

subject to \\( \sum_{i=1}^n w_ix_i \leq K \\). We call the maximum value obtained the *optimal value*.

The problem is NP-hard.

## Greedy algorithms

A näive greedy algorithm is this: sort the items according to some heuristic, then choose items one by one until the capacity is reached.

You can for example choose the lightest elements first (hoping that taking many elements will optimize the problem), or you can take the most valuable items first.

The greedy algorithms are fast. The only real work done is sorting the list of items, which is done in \\( \mathscr O (n \log n) \\) time. They are however not optimal.

## Dynamic programming

[Wikipedia](https://en.wikipedia.org/wiki/Dynamic_programming)'s definition of dynamic programming is this: "dynamic programming is a method for solving a complex problem by breaking it down into a collection of simpler subproblems, solving each of those subproblems just once, and storing their solutions."

The idea in the case of the knapsack problem is then this: solve the problem first for just one item, then for two, using the solution for the one time case to avoid repeating calculations.

First some notation. Let \\( O(K,n) \\) denote the optimal value of the knapsack problem using the n first elements (if we have exactly n elements in total, this will be the optimal value we're looking for).

Denote by \\( w_1,\ldots,w_n \\) all the weights, and by \\( v_1,\ldots,v_n \\) all the values.

Suppose we know the value of \\( O(k,j-1) \\) for all \\( k=0,\ldots,K \\). Then what can we say about \\( O(k,j) \\)? If we select item j, then the optimal value is \\( O(k-w_j,j-1)+v_j \\). If we don't select item j, the optimal value is \\( O(k,j-1) \\). If item j weighs too much, that is, \\( w_j > k \\), the optimal solution is \\( O(k,j-1) \\).

Thus we have the "Bellman equations":

$$
O(k,n) =
\begin{cases}
\max(O\left(k-w_j,j-1)+v_j, O(k,j-1)\right)  & \text{ if } w_j > k\\
O(k,j-1) & \text{else.}
\end{cases}
$$

This can easily be turned into a computer program. Think of it as follows. The solution is found by filling in values in a $K \times n$ table. The first column is filled with just zeroes (representing choosing zero items, hence we get zero value back). The second column's row $r$ is $0$ if item 1 weighs more than $r$, and it is filled with $v_1$ if $r > w_1$.

The fill in column $j$, we only need to know two of the values in the previous row.

Given a filled-out table, we need to recover the items chosen. This is easy: we start at the bottom right corner, and ask if the value to the left is different. If it is different, that means we chose item $n$ in the algorithm above. If it is not different, we move up to position $(n-1,K-w_n)$ and repeat.

What about the complexity of the algorithm? Filling the table takes $\mathscr O(Kn)$ steps, but it is exponential in terms of input size: the number of bits $x$ needed to represent K is $x=\log_2 K \Leftrightarrow K=2^x$. Thus the complexity in terms of bit size is $\mathscr O(n2^x)$.

## Relaxation, branch and bound

The dynamic programming algorithm above is inefficient in that it explores *all* possibilites, which for large $n$ is of order $2^n$.

If we can bound the optimal value resulting from the choices made, we might exclude some choices to speed up computations.

Think of the choice of including item $j$ as creating a branch on a binary tree (include: left subtree, exclude: right subtree). The whole tree has $2^n$ leaves.

Each leaf has a *value*, which is the sum $\sum_{\text{chosen}} v_i$. Also, *room*, which is $K-\sum_{\text{chosen}} w_i$. And an *estimate*, which is used for pruning the tree.

The difficulty is choosing a smart estimation function. We don't just want any estimation function: we want it to satisfy one important property, namely that it is *optimistic*, meaning that we always estimate *more* than what is possible given that branch.

This means that if the optimistic estimation in one branch is *less* than that of the other branch, we can safely discard it, thus saving us from traversing that part of the tree.

One naïve choice for an estimation function is to take the sum of all the remaining values $\sum_{\text{not chosen}} v_i$. This works and can give some optimization.

However, a slightly better estimation function can be achieved by using *linear relaxation*. To compute the optimal value, instead of requiring the $x_i$'s to be either 0 or 1, we allow them to be any number in the interval $[0,1]$.

To compute an optimistic estimation, we sort the remaining variables according to their value per weight ratio $v_i/w_i$, filling the knapsack one by one until there is no more room. Then we put in a fraction of the next, filling the knapsack. This gives a better optimistic estimation than the sum above.

## Search strategies



