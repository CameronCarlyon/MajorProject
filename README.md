# An Integrated Product Visualisation and Ticketing System - Documentation

## Overview

This project is a responsive airline booking prototype with integrated cabin visualisation. It explores how panoramic product visualisation can improve the seat selection experience and upselling potential by providing customers with a clearer view of cabin layout, legroom, amenities, and emergency exit locations during the booking process.

## Level 6: Major Project Module Summary

"The major project will provide a period of sustained engagement with a chosen field of expertise and provide the opportunity for students to showcase their specialist practical skills. The project will allow students to develop their practical and theoretical skills by selecting, evaluating and analysing a pertinent issue within the contemporary computer games industry. Through the development of a major project students will prepare and submit a formal written report that engages with the theoretical, contextual and practical considerations of the project and the wider subject of computer games."

## Project Structure

```text
webpage/
├── index.html
├── booking.html
├── confirmation.html
├── dissertation.html
├── documentation.html
├── styles.css
├── site.js
├── booking.js
├── cabin-layout.js
├── airports.js
├── booking/
│   ├── controls.js
│   ├── form-validator.js
│   ├── navigation.js
│   ├── panorama-viewer.js
│   ├── seating.js
│   └── shared.js
└── assets/
```

## Key Features

- Responsive multi-tab booking flow.
- Interactive seat selection and cabin layout logic.
- 360 panoramic cabin views using Photo Sphere Viewer.
- Shared styling and modular JavaScript across the site.
- Integrated dissertation page for project documentation.
- Built in pure HTML, CSS, and JavaScript.

## 3D Modelling And Rendering

The cabin environment was created in Blender using a modular asset workflow. Reusable parts such as seating, divider walls, cabin panels and surrounding interior elements were built once and distributed appropriately throughout the scene, which drastically reduced development time and made iteration more efficient. Materials were produced procedurally using Blender's node system, allowing fabric detail, roughness variation, and subtle surface wear to be generated directly in the shader setup without any loss of detail at high zoom values.

Custom cabin decals were created in Adobe Photoshop, including bilingual signage in Arabic and English that matched the proportions and typography of their real-world counterparts. Colour channels, opacity and emission values were then configured within the Blender node setup to integrate the decals into the scene accurately.

Lighting and rendering were also handled in Blender. The final web experience uses pre-rendered stills and 360 equirectangular panoramas rather than real-time browser rendering, allowing the project to retain detailed lighting, reflections and atmosphere while remaining practical on mobile devices. Cabin fixtures, accent lights and an HDRI environment were combined to shape the overall mood and external light.

## Website

The site replicates the structure and visual language of the Emirates Airline website. It is built in pure HTML, CSS, and JavaScript with no framework dependencies, and is organised across a landing page, booking portal, confirmation page and dissertation/documentation pages. JavaScript is split into focused modules handling concerns such as seat selection, form validation, panorama viewing, airport data, and navigation state.

The booking flow includes a multi-tab interface covering flight search, passenger details, seat selection and summary. Seat selection is linked directly to the panorama viewer. Selecting a seat loads the corresponding pre-rendered 360 view of that seating position within the cabin, providing the user with a realistic representation of what to expect onboard. The seating chart reflects real a aircraft configuration for the Emirates Boeing 777-300ER economy cabin.

Design follows Emirates brand conventions throughout, using CSS custom properties for consistent branding colours and spacing tokens. Forms include inline validation with clear error feedback, and all interactive elements are keyboard accessible with visible focus states.

## Optimisation

The site was built around performance and broad device support. Panoramic seat views are delivered as pre-rendered images through Photo Sphere Viewer, which reduces client-side rendering cost while preserving visual quality. Key renders and panorama assets were converted to WebP where appropriate, with fallback formats retained where needed. Fonts are preloaded, scripts are deferred, and CSS uses responsive layouts and image-set fallbacks to keep the experience lightweight and usable across desktop, tablet and mobile screens.

## Usage

To experience the project, [please visit the project website.](https://cameroncarlyon.com/visualisationproject/)

## Notes

This project was developed for academic purposes as part of a final project investigating product visualisation within airline booking systems.
