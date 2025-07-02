---
layout: post
title: Minimal setup Java LWJGL (on an M3 Mac)
date: 2025-03-02 14:53 +0100
published: false
tags: java opengl
---

I wanted to learn a little about shaders recently. I ended up with a mild case of choice paralysis: where should I run the shader code (in the browser, with C++, like half of the examples)? Should I spend time learning and setting up C++ first? Or should I just learn WebGL, and not OpenGL?

I stumbled upon [LWJGL](https://www.lwjgl.org/) (*L*ight*W*eight *J*ava *G*ame *L*ibrary), which wraps C libraries like GLFW, and has bindings to OpenGL.

It took a little while for me to run a basic shader on my Mac, so I thought I'd write down what I did.

First off, the LWJGL web site has a "Customize" page where one can get a Gradle build file with the necessary dependencies to get started.

The minimal needed for running an OpenGL shader is LWJGL itself, the GLFW bindings (`org.lwjgl:lwjgl-glfw`), and bindings to OpenGL (`org.lwjgl:lwjgl-opengl`). See the `build.gradle.kts` file (for syntax etc) [at Github](https://github.com/FredrikMeyer/minimal-lwjgl/blob/v0.1/app/build.gradle.kts). GLFW: From their own web page:

> GLFW is an Open Source, multi-platform library for OpenGL, OpenGL ES and Vulkan development on the desktop. It provides a simple API for creating windows, contexts and surfaces, receiving input and events.


The full example code is available [in this Gist](https://gist.github.com/FredrikMeyer/5e77b2576c18bf5ed0cff6667faf5303).

It has the following setup:
```java
public class App {
  public void run() {}
  public void init() {}
  public void loop() {}
  public void clean() {}
}
```

The `run` method starts everything, and is very small. The `init` method sets up [GLFW](https://www.glfw.org/) (which is responsible for creating a window to render things to).

The `loop` method initiates the geometry to be sent to OpenGL, and runs a loop that runs the program until the user closes the window or presses escape.

Finally, in the cleanup method, buffers in memory are freed.

## The `run` method

Here is the full `run` method:
```java
    public void run() {
        init();
        loop();

        clean();

        // Free the window callbacks and destroy the window
        glfwFreeCallbacks(window);
        glfwDestroyWindow(window);

        // Terminate GLFW and free the error callback
        glfwTerminate();

        Objects.requireNonNull(glfwSetErrorCallback(null)).free();
    }
```

It calls the `init` method, the `loop`method, the `clean` method, and does some final cleaning.

## The `init` method, setting up GLFW

This method is basically the same as the one in the "[Getting started](https://www.lwjgl.org/guide)" guide on the official LWJGL web site, with the exception that some additional [window hints](https://www.glfw.org/docs/3.3/window_guide.html#window_hints) were needed to run on Mac. Here are the ones I ended up using:

```java
glfwWindowHint(GLFW_VISIBLE, GLFW_FALSE); // the window will stay hidden after creation
glfwWindowHint(GLFW_RESIZABLE, GLFW_TRUE); // the window will be resizable
glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 4);
glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 1);
glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);
```

Because Apple [has deprecated OpenGL](https://venturebeat.com/games/apple-defends-end-of-opengl-as-mac-game-developers-threaten-to-leave/), the latest version of OpenGL we can run is 4.1.

The two last ones were recommended on the [GLFW FAQ page](https://www.glfw.org/faq.html#41---how-do-i-create-an-opengl-30-context) for macOS.

## The `loop` method

I will only describe here what deviates from the setup in the LWJGL guide. The first step is to set up the shaders, which reminds that I haven't said anything about what shaders are.

### Shaders

I will only write what little I understand at this point. The shaders in this context are written in GLSL, which is the _OpenGL Shading Language_. There are two types of shaders: vertex shaders and fragment shaders.

The vertex shader computes the position of input vertices, while the fragment shaders computes the screen color. For a more detailed explanation of what shaders are, I recommend [The Book of Shaders](https://thebookofshaders.com/00/).

<center>
{% plantuml %}
title OpenGL Shader Pipeline

skinparam rectangle {
    BackgroundColor LightBlue
    BorderColor Black
    FontColor Black
}

rectangle "Application" as app
rectangle "Vertex Shader" as vshader
rectangle "Rasterizer" as raster
rectangle "Fragment Shader" as fshader
rectangle "Framebuffer" as fb

app -right-> vshader : Pass vertices
vshader --> raster : Processed vertices
raster -left-> fshader : Fragments
fshader --> fb : Colored pixels
{% endplantuml %}
</center>

### Back to `loop`

The very first thing we need to do is to call `GL.createCapabilities();`{:.language-java .highlight}. This is a formality to bind the foreign bindings to the current thread.

The first thing we want to do is to inform OpenGL about our geometry. Let's make a simple triangle.

```java
float[] vertices = new float[]{
          -0.5f, (float) (-0.5f * (sqrt(3)) / 3),    0.0f,
          0.5f,  (float) (-0.5f * (sqrt(3)) / 3),    0.0f,
          0.0f,  (float) (0.5f * (sqrt(3)) * 2 / 3), 0.0f,
};
int[] indices = new int[]{0, 1, 2};
```

<center>
<svg width="200" height="200" viewBox="-1 -1 2 1.5">
  <polygon points="-0.5,0.288675 0.5,0.288675 0,-0.57735" style="fill:#eee;stroke:purple;stroke-width:0.01" />
  
  <!-- Vertex Labels -->
  <text x="-0.55" y="0.35" font-size="0.1" text-anchor="middle" fill="black">0</text>
  <text x="0.55" y="0.35" font-size="0.1" text-anchor="middle" fill="black">1</text>
  <text x="0" y="-0.60" font-size="0.1" text-anchor="middle" fill="black">2</text>
</svg>
</center>

The vertices live in a three-dimensional coordinate system (with the last coordinate set to zero). We also define the `indices` array, which will be used to tell OpenGL that the first three numbers define the first vertex, the second three the second vertex, and so on. This is useful when defining several triangles that share vertices.

Next, we must pass this information to OpenGL. We first pass the vertices to OpenGL:

```java
vaoId = glGenVertexArrays();
glBindVertexArray(vaoId);

FloatBuffer verticesBuffer = MemoryUtil.memAllocFloat(vertices.length);
verticesBuffer.put(vertices).flip();

vboId = glGenBuffers();

glBindBuffer(GL_ARRAY_BUFFER, vboId);
glBufferData(GL_ARRAY_BUFFER, verticesBuffer, GL_STATIC_DRAW);

MemoryUtil.memFree(verticesBuffer);

indicesId = glGenBuffers();
glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, indicesId);
glBufferData(GL_ELEMENT_ARRAY_BUFFER, indices, GL_STATIC_DRAW);
```

When reading about OpenGL online, one often sees the phrase "OpenGL is a state machine". This means that OpenGL operates within an OpenGL _context_, where different function calls, such as `glBindBuffer`, determine which buffer is currently active for OpenGL operations.

So to summarize the above code snippet: we first generate a vertex array object, and bind it to the current context. Then we make a buffer, bind it (meaning marking it as current), and transfer the vertices to it (after which we can free the memory reserved for the vertices array).

Finally, we tell OpenGL where the indices are by binding the element array buffer (often called shortened _EBO_, for "Element Buffer Object"), and calling the `glBufferData` function.

The last part are these two lines:
```java
glVertexAttribPointer(0, 3, GL_FLOAT, false, 0, 0);
glEnableVertexAttribArray(0);
```

The first argument (zero), refers to the "index" where the shader can access the vertives. This is needed, because in addition to positions, one can also pass an array of colors, for example. The next argument is the size of each "vertex attribute". Since there are three cordinates per points, we put 3 here. The next is the data type. The `false` means no to normalization. The last are stride and pointer.

<details>
<summary>
Click here to see a sequence diagram of the operations.
</summary>
{% plantuml %}
@startuml
actor User
participant "OpenGL Context" as GL
participant "Vertex Array Object (VAO)" as VAO
participant "Vertex Buffer Object (VBO)" as VBO
participant "Element Buffer Object (EBO)" as EBO

User -> GL: glGenVertexArrays()
GL -> VAO: Generate VAO (vaoId) 
User -> GL: glBindVertexArray(vaoId)
GL -> VAO: Bind VAO

User -> GL: glGenBuffers() \n(VBO)
GL -> VBO: Generate VBO (vboId)
User -> GL: glBindBuffer(GL_ARRAY_BUFFER, vboId)
GL -> VBO: Bind VBO

User -> GL: glBufferData(GL_ARRAY_BUFFER, verticesBuffer, GL_STATIC_DRAW)
GL -> VBO: Upload vertex data

User -> GL: glGenBuffers() \n(EBO)
GL -> EBO: Generate EBO (eboId)
User -> GL: glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, eboId)
GL -> EBO: Bind EBO

User -> GL: glBufferData(GL_ELEMENT_ARRAY_BUFFER, indices, GL_STATIC_DRAW)
GL -> EBO: Upload index data

User -> GL: glVertexAttribPointer(0, 3, GL_FLOAT, false, 0, 0)
GL -> VAO: Setup vertex attributes

User -> GL: glEnableVertexAttribArray(0)
GL -> VAO: Enable vertex attribute array

User -> GL: glBindBuffer(GL_ARRAY_BUFFER, 0)
GL -> VBO: Unbind VBO
User -> GL: glBindVertexArray(0)
GL -> VAO: Unbind VAO
User -> GL: glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0)
GL -> EBO: Unbind EBO
 
@enduml
{% endplantuml %}
</details>

To load our shaders we do the following:

```java
var vertexShader = glCreateShader(GL_VERTEX_SHADER);
glShaderSource(vertexShader, Utils.loadResource("minimal/vertex.glsl"));
glCompileShader(vertexShader);

var fragmentShader = glCreateShader(GL_FRAGMENT_SHADER);
glShaderSource(fragmentShader, Utils.loadResource("minimal/fragment.glsl"));
glCompileShader(fragmentShader);
```

This creates two shader objects and compiles them. Finally, we can combine them into a _shader program_ object: 

```java
var shaderProgram = glCreateProgram();
glAttachShader(shaderProgram, vertexShader);
glAttachShader(shaderProgram, fragmentShader);
glLinkProgram(shaderProgram);

glDeleteShader(vertexShader);
glDeleteShader(fragmentShader);
```

We can now delete the references to the shader objects themselves.

Finally, we can enter the rendering loop:

```java
while (!glfwWindowShouldClose(window)) {
    // Clear the screen
    glClearColor(0.07f, 0.13f, 0.17f, 1.0f);
    // Clean the back buffer and assign the new color to it
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    glBindVertexArray(vaoId);
    glUseProgram(shaderProgram);
    glDrawElements(GL_TRIANGLES, indices.length, GL_UNSIGNED_INT, 0);
    
    glfwSwapBuffers(window);
    glfwPollEvents();
}
```

We clear the screen, bind the vertex array objevt, and use the shader. Finally we tell OpenGL to draw triangles.

## Conclusion

The code for this example can be found in [the Gist here](https://gist.github.com/FredrikMeyer/5e77b2576c18bf5ed0cff6667faf5303).

I have written this to learn about the concepts. Some useful sources have been [https://learnopengl.com/](https://learnopengl.com/), and [this YouTube series](https://www.youtube.com/watch?v=u-00hjlfMKc&list=PLPaoO-vpZnumdcb4tZc4x5Q-v7CkrQ6M-&index=8), which was very easy to translate from C++ to Java.


<!-- TODO att jwjgl på twitte -->
