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
- [] space event handler isn't being removed
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
- [x] narrator text needs to be more visible
- [x] narrator text needs to be centered
- [x] narrator text needs to be highlighted
- [x] narrator text needs to have better padding
