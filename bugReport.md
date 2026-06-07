# Bug Report History

## Critical
- None

## Warning
- [2026-06-07 11:20:00 UTC] **Paper-thin Hollow Cuts & White Bleeding Borders**: Removing the `boxGeometry` completely left the sliced packages hollow with visible inner void air, while having full-width `boxGeometry` stretched the alphaMap and leaked bright white silver outline lines. Resolved by introducing a 3D bevel core (`width: 2.62`) smaller than the wrapping planes, colored in a solid deep dark obsidian matte.

## Suggestion
- None
