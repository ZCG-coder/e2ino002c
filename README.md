# HKAGE Programme E2INO002C - "Magnesium"

## A brief introduction of this program (for those who do not know about it)

> This programme series is designed to enhance students’ knowledge and interest in Artificial Intelligence (AI)
> and Internet of Things (IoT) through applying design thinking process to make smart living products.
> Students will engage in hands-on design challenges that focus on developing empathy, encouraging
> ideation, developing metacognitive awareness, and fostering creative problem-solving. Throughout the
> programme, students will acquire skills including computer-aided design (CAD) drawing, making a prototype
> by using 3D printer, laser cutter, electronic circuit, and computer programming. The group design mini
> project is targeted to inspire students in creativity, collaboration, and design talent.

– Quoted from [this PDF file](https://hkage.org.hk/flyer/5024_E2INO002C_en.pdf)

This code is written by Andy Zhang, participating in this program from Jan to Feb 2024 in Group 1.

Our project is a smart Newton's Cradle that tries to help those struggling with anxiety.

## What is this?

This repository contains the source code of the management application running on the client, aka. the user's mobile
device.
It allows adding to the home screen and acting as a "normal" application. The user needs to install this app, then
configure the appropriate host name and port in order to connect to
the [server](https://github.com/ZCG-Coder/e2ino002c-server),
which serves the planning resources and performs recognition.

The name "Magnesium" comes from "Management", as the words contain quite a number of common letters.

## Features

### 1. Chatting with the Virtual chatbot

A chatbot trained based on Google's Bison-text is available with the app, whose name is Judy. She can talk with you
wherever you are, whenever you would like it.

### 2. Listening to Music

The app can play music for your relaxation. While the music is playing, it sends a signal to the server to start
detecting the user's motion and give a feedback score.

### 3. Planning the day

You can write and view the day plan. The plan lets you create outing sessions and list out the things to bring for the
outing.

### 4. Going for an outing

The device and app can help you to take all the items for an outing session. It sends a signal to the server, which
detects special barcodes on the objects, which are then sent back to the client and represented by a check.

### 5. User preferences

The user can customize the application to their preference, including preferred dark mode, text size and the IP address
of the server.
