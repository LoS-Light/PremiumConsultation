# ADR-005: The Consultation screen is one FlatList

**Status:** Superseded by ADR-012 (2026-10-22): the content now lives in a bottom sheet over a fixed hero; the list stays a single virtualized FlatList inside the sheet.

The screen scrolls as one page: hero and title, the Specialist list, then contact info and agreements. Nesting a `FlatList` inside a `ScrollView`, the obvious way to build that, turns off the list's virtualization, which matters once the list grows to 103 Specialists in v1.1.0. So the whole page is a single `FlatList`, with the content above and below the list in `ListHeaderComponent` and `ListFooterComponent`, and the bottom section sits outside it. Every layout change to the screen has to respect this structure.
