export const washingModes = {
  Cotton: [
    { label: 'Cold', minutes: 143 },        // 88 + 55
    { label: '20°C', minutes: 148 },        // 93 + 55
    { label: '40°C', minutes: 392 },        // 337 + 55
    { label: '60°C', minutes: 350 },        // 295 + 55
    { label: '90°C', minutes: 204 },        // 149 + 55
  ],
  Mix: [
    { label: 'Cold', minutes: 121 },        // 66 + 55
    { label: '40°C', minutes: 133 },        // 78 + 55
    { label: '60°C', minutes: 150 },        // 95 + 55
  ],
  Synthetic: [
    { label: 'Cold', minutes: 116 },        // 61 + 55
    { label: '40°C', minutes: 128 },        // 73 + 55
  ],
  Delicate: [
    { label: 'Cold', minutes: 111 },        // 56 + 55
    { label: '20°C', minutes: 114 },        // 59 + 55
  ],
  'Tub Clean': [
    { label: '60°C', minutes: 133 },        // 78 + 55
  ],
  Spin: [
    { label: 'No temperature', minutes: 69 }, // 14 + 55
  ],
  "Quick 15'": [
    { label: 'Cold', minutes: 70 },         // 15 + 55
  ],
  'Rinse+Spin': [
    { label: 'Cold', minutes: 89 },         // 34 + 55
  ],
};