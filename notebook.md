# Project notebook
## Project initiated by Hugo Castaneda - 18/11/2019
### Tool app to help the teacher with his lectures

---
## Goal
Create a set of tools to help the teacher sharing information with class, storing student data, monitoring the course progess, etc.


## Features thincking

One good Core feature would be to be able to create tools that can be accessed via a menu bar. This bar could be the main bar has the main goal for the teacher is to access tools fastly.

Those tools could have access to same database (this is why the boolMaster system is used internaly to the app). In this data base basic infos can be stored like student names ...

The core JS system gives access to the creation of such tools. A tool button will be created in the tool bar refreshing the main page area to display the tool system.

A tool would be composed of such methods as:
 * Init - to init the system with its data, etc.
 * Run - to run the system (maybe not useful)
 * End - to end a tool (maybe for saving stuff)

Also it would be interesting in the future tobe able to use multiple tools at the same time (split screen for example). But for now, we'll use multiple application instances..

## Core system

In order to display the tools button we need a method to retrieve the tools and show their buttons. But first, how do we "store" those tools, are they scripts, or json properties ? We first need to figure out how to model this information.

For now, this tools are stored in a JSON inside the "teacher_utils.js" file

One good feature to add to the boolMaster system is an updater telling the system that an update occured to constantly check for file data update
