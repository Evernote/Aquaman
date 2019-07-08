# Aquaman
Aquaman allows you to build composable, declarative flows with Redux.

[See full documentation.](https://evernote-1.gitbook.io/aquaman/)

![Aquaman](https://blobscdn.gitbook.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LiOxqnL7wPXk1pl8oaH%2F-LiP-YkLvvsrc7bswsfj%2F-LiP-g4Tv1Z6UK7OIxd5%2FStorm%20(1).jpg?alt=media&token=9e57d790-e1d5-4cab-ae56-c19160942b63)

## What is Aquaman for?
Aquaman can be helpful if you need to guide users through a series of steps through an application. At Evernote, we use Aquaman to onboard new users by stepping through a series on educational modals and tooltips.
Flows in Aquaman are built from arrays, where each item in the array represents a single step in the flow. Each step can be a Redux action (eg. show a modal or tooltip), a sub-series of actions (eg. show a tooltip, create a record, and fire a GA event -- all at once), or branch into a sub-flow based on user input.


## Why use Aquaman?
Aquaman allows you to build components that know nothing about where in a flow they are, or what comes next. It just knows that they're in a flow. That means when you're constructing your flow, it's very clear what is going to happen in each step, and you can easily rearrange, remove, or reuse steps without breaking anything.