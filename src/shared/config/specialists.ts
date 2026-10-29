// Simulated network delay for the hardcoded Specialist list, long enough that the loading
// skeleton and the next-page spinner can be seen in the demo.
export const SPECIALISTS_LATENCY_MS = 1500;

// Specialists per page in infinite mode (SPEC §6.2): 103 load in 11 pages, so loading, failure
// and Retry come up often in the demo.
export const SPECIALISTS_PAGE_SIZE = 10;

// With "Simulate loading failure" on, the share of requests that fail (SPEC §10).
export const SIMULATED_FAILURE_RATE = 0.3;
