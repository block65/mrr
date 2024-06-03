Credit to [@nikparo](https://github.com/nikparo) for "Running React parent effects before child effects"

```
// Sometimes you want to run parent effects before those of the children. E.g. when setting
// something up or binding document event listeners. By passing the effect to the first child it
// will run before any effects by later children.
```

https://gist.github.com/nikparo/33544fe0228dd5aa6f0de8d03e96c378
