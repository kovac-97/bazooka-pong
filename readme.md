Vanilla JavaScript Game - Bazooka pong

Play at: https://kovac-97.github.io/bazooka-pong/

Overview

This is a personal game development project undertaken to improve my JavaScript and general programming skills. It's a non-commercial endeavor aimed at showcasing various features that JavaScript has to offer, including multithreading, events, object oriented programming, Promises, and functional programming. I attempted to make the code as modular as possible and use good software development practices, however other projects await so you can expect some bugs.

In addition to the primary purpose of this being a portfolio, I hope it will provide some insight into JavaScript and game development in general to anyone who is in the process of studying it. I followed some MDN tutorials and decided to get a bit creative. Be sure to check those out if you are just starting: https://developer.mozilla.org/en-US/docs/Games/Introduction

JavaScript Features

Multithreading: Parallelization of collision detection tasks using WebWorkers. Decided to turn it off by default as it actually degraded performance on mobile devices.

Events: Used them to avoid complex logic implementation, primarily to work with UI and Game communication.

Classes: While they are rare in regular JavaScript, they are useful when working on large projects such as game development.

Promises: Used promises to achieve await capability with WebWorkers.

Functional Programming: Used some functional programming to generate boxes.

Assets

The project uses assets found on the internet some time ago. If you are the creator of any of these assets and wish to be credited, please contact me at kovanikola@gmail.com. Additionally, the blue-bullet.png is an edited version of bullet.png.

Contact

For any inquiries feel free to reach out at kovanikola@gmail.com.

Local install: Due to use of fetch API, you will have to create a local HTTP server:

    git clone https://github.com/kovac-97/bazooka-pong

You can use python to create an HTTP server:

    cd bazooka-pong
    python3 -m http.server 8080

Acces the game using your browser at localhost:8080
