 Orchestration New Functionality:
- [x] change targeting to allow for position
- [] generate floating text on ray intersection of character
- [x] system text in the overlay component
- [] hook up constellation expansion
- [] hook up constellation zoom
- [] design label component
- [] hook up label component
- [] constellation glyph animation
- [] move constellation to position when journal animates in
- [] hook up journal animation
- [] add text to journals
- [] add static shapes/constellations etc. to journals
- [] add shapes to journals + configure dragging

3D Modelling
- [] change campfire scene layout
- [] change character model
- [] add shaders to trees
- [] add back in depth of field/fog/etc.
- [] change fire sps so it looks better

Bug Fixes:
- [] thread opacity
- [] comments
- [] white borders at edge of constellation
- [] add roughness map to journal
- [] remove persistent selection from central node


Narrator Voice Bugs:
- [x] space event handler isn't being removed
- [] janky timing with narrator and system because they're being manually reset at the beginning of new commands
- [] system component is not registering as done after pressing space when it's last in the chain
- [] remove progressive blur when constellation expansion is triggered by the narrator voice system
- [] refactor component to exist in game sync provider
- [] maybe centralize everything into the callback systems (?)

Tech Debt:
- [] animation timings for name and concept shapes are currently handled with timeouts
- [] you want to be able to see the processing state of different event trigger states so you can prevent new state until old state is complete 

Misc. Fixes:
- [] fix stars and clouds so the animation fades into itself rather than jump-cutting
- [] fix weird shadow on the onlines of the constellation
- [] Name of the game in physical text in the environment

Actual Game Todo:
- [] two versions of the journal -- one when you're in constellation mode, one when you're in campfire mode 

Later Decisions:
- [] need to decide what the preferentiable API for updating shape utils is: context or shape props



Notes:
- Current architectural pattern:
    1. In global sync provider, create state-based triggers
    2. State-based triggers route through components and helper components at the World Canvas level (what's the balance here?)
    3. Open question: do these triggers all work through state prop updates?
        1. Makes sense for some things like expanded, but feels weird for actions like ripples etc.


Flow Notes:
- [] fix initial loading state and campfire smoke
- [x] narrator text needs to be more visible
- [x] narrator text needs to be centered
- [x] narrator text needs to be highlighted
- [x] narrator text needs to have better padding
- [x] better transition effect
- [] play with depth of field at the beginning
- [] multi-line components


New Fixes:
- [] make constellation unclickable at the beginning until the pitch starts
- [] initial loading state and campfire smoke (same problem)
- [] delay isn't working properly for system component (specifically during the first of the three pitches)
- [] fix visibility of press space to continue
- [] when the journal opens, the constellation should move to the left
- [] fix narrator model and scene visibility
- [] fix timing on the constellation label so it happens more immediately
- Less Essential
    - [] fix shaders for the scene
- [] make sure it can't go down instead of up
- [] make sure overlay fades out properly

New To Dos:
- [] create subtitle for title screen 
- [] narrator face blips out 
- [] disable camera arrow keys






After Roadtrip To Dos:
- [x] make starlight disappear more quickly BLOCKED -- WORKAROUND
- [x] upload elevator pitch
- [x] create mechanics flow
- [x] create technical foundations page
- [x] fix resizing
- [] fix movement between different parts of the pitch

- [] add journal cover
- [] fix the text for typos and styling
- [] shorten all text
- [x] fix the next button
- [x] fix campfire visibility
- [] fix collapsing stars
- [] add tooltip to journal

- [] add version number
- [] add subtitle
- [] add media articles about game design