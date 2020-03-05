---
layout: post
published: false
title:  "Permutations of a list in Java"
date:   2018-01-10 19:46:05 +0100
categories: programming java
---

Say you have an ordered list of $n$ objects and you want a list of all its permutations. Here's how I did it in Java.

It is based on the following observation: if you know all permutations of the last $n-1$ elements of your list, then set of all permuations of $n$ elements is found as follows: for each permutation of the last $n-1$ elements, insert the first element at all positions.

The base case is this: if you have only one element to permute, there is only the trivial permutation.

```java
public <T> List<List<T>> permutations(List<T> list) {
  if (list.size() <= 1) {
    ArrayList<List<T>> result = new ArrayList<List<T>>();
    result.add(list);
    return result;
  }
  List<List<T>> permutationsOfSubList = permutations(list.subList(1,list.size()));
  ArrayList<List<T>> result = new ArrayList<List<T>>();
  
  for (int i = 0; i < list.size(); i++) {
    for (List<T> I : permutationsOfSubList) {
      result.add(putiInBefore(i, list.get(0), I));
    }
  }
  return result;
}
```

The method `putInBefore` inserts the element in the second argument at position `i` in the list that is the third argument:
```java
public <T> List<T> putiInBefore(int i, T a, List<T> list) {
  ArrayList<T> result = new ArrayList<T>();
  int j = 0;
  for (; j < i; j++) {
    result.add(list.get(j));
  }
  result.add(a);
  j++;
  for (; j < list.size()+1; j++) {
    result.add(list.get(j-1));
  }
  return result;
}
```

As far as I know, there is no standard library way to do this.
