# Design and acceptance contract

## Scope

Quiet Meridian is a complete solo fleet duel, with original coastal chart art and a quiet paper-and-sea palette. Classic mechanics take priority: 10×10 charts, five straight ships, concealed rival placement, legal boundaries, no overlaps, single alternating shots, hit/miss/sunk reports, immediate win/loss and restart. Ships may touch. Human starts. There is no salvo mode or extra turn after hitting.

## Decisions

The delegated request authorizes sensible choices. Installed Matt Pocock Grill with Docs, domain modeling and Implement guidance informed this document and glossary. Their interview/confirmation and commit defaults are superseded by the user's explicit scope and subsequent publication approval. Engine behavior and real DOM controls are the requested test boundaries. No local memory files were edited.

Use dependency-free browser scripts so the root HTML works directly and over loopback without a bundler. Keep rules separate from presentation so deterministic tests can check real public game behavior. The game state remains in a closure. The AI accepts only copied shot reports; the controller resolves its chosen coordinate against the player's board. In-browser users can inspect client-side files; this is a solo game, not a secure multiplayer server.

## Lifecycle

Deployment → battle (human first) → complete. Only a legal new shot changes the turn. Opponent delay is 650ms; inputs are guarded synchronously by the rules engine. New mission opens a native modal confirmation. Confirm cancels the timer, advances an epoch guard, clears both fleets/history/selection and returns to deployment. Cancel preserves the current game. At completion both fleets are visible, and no shots can change state.

## Accessibility and controls

Native buttons and dialogs, live status text, descriptive chart-cell labels, visible focus, roving chart tabindex and arrow navigation, symbols as well as colors, reduced-motion support. Placement uses selection plus a starting cell so mouse, touch and keyboard share one model. Touch does not require dragging or hovering. At narrow widths the cards stack. Physical touch devices and assistive technology need separate human acceptance.
