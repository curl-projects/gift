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


Narrator Voice Bugs:
- [] space event handler isn't being removed
- [] janky timing with narrator and system because they're being manually reset at the beginning of new commands
- [] system component is not registering as done after pressing space when it's last in the chain
- [] remove progressive blur when constellation expansion is triggered by the narrator voice system

Tech Debt:
- [] animation timings for name and concept shapes are currently handled with timeouts