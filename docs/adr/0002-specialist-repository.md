# ADR-002: Specialists are read only through a repository interface

The PRD says to hardcode the Specialist list now and move it to a CMS in Q2, and the brief asks for code where that swap is easy. Screens and hooks therefore depend only on a `SpecialistRepository` interface (offset-paginated from v1.0.0), provided through a React context, and read it through TanStack Query; `HardcodedSpecialistRepository` implements it today and `CmsSpecialistRepository` will in Q2, so the swap is one line in the provider setup. The cost is an abstraction over what is, for now, three hardcoded records.
