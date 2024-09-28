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

- [x] add journal cover
- [] fix the text for typos and styling
- [] shorten all text
- [x] fix the next button
- [x] fix campfire visibility
- [x] fix collapsing stars
- [x] fix initial campfire blip
- [x] add tooltip to journal

- [x] add version number
- [x] add subtitle
- [] add media articles about game design
- [x] add the ability to hide and show the main star
- [x] entrance animation for central star 
- [x] recenter star when zooming back in
- [x] deploy online
- [] stop it from showing up on phones
- [] prevent people from typing in the media objects (deprioritized)
- [x] fix command leak


FINAL CHECKLIST:
- [x] Elevator Pitch

- [] Design Philosophy
    - [x] Upload media documents for design philosophy
    - [x] Remove unnecessary excerpts from "Virtual Self-Representation" & "Resonance-Based Connection"

- [x] Mechanics
    - [x] shorten mechanics text
    - [] add paragraph spacing and rich text into system text components
    - [x] add starlight icon to the the cover page during the flow

- [] Technical Foundations
    - [x] Link to Github

- [] Why is this important?
    - [x] Finish script using narrator voice
    - [] add rich text capabilities to narrator text


- [] Get in Touch
    - [] improve animation of contact
    - [] add ability to copy or select the address

- [] Demo
    - [] delete excerpts when star disppears
    - [] add portfolio
    - [] screen flickers when moving back to the constellation view
    - [] when constellation expands, it moves to a random location
    - [x] moon in journal doesn't have the right center of rotation
    - [x] learn more in journal doesn't work
    - [] journal breaks when you click home

- [] Misc. Stuff
    - [] check that the system works on phone
    - [] add waitlist
    - [] check multiple browsers:
        - [] safari
            - small fixes
        - [] firefox
            - small fixes
        - [] edge
            - large fixes
        - [] arc
            - very small fixes

- [] Transitions
    - [] if you transition to and from home quickly, it doesn't transition properly
    - [] force text events to clear
    - [] clear title next button immediately when the narrator event changes 
    - [] fix the flickering white border as the system re-adjusts
    - [] mechanics transition to home doesn't work


    - transitions don't
    

- SAFARI BUGS
    - [] svg height and width
    - [] svg roughness doesn't apply
        - title component
        - journal component


Breaking Fixes:


Non-Essential Bugs:
- prevent zoom on page when hovering over media object
- fix starlight on mobile