export const COLOR_SCALE = {
  0: 'bg-rose-100', // Empty/Low
  1: 'bg-rose-300',
  2: 'bg-rose-400',
  3: 'bg-rose-500',
  4: 'bg-rose-700', // High intensity
};

export const BORDER_SCALE = {
    0: 'border-rose-200',
    1: 'border-rose-400',
    2: 'border-rose-500',
    3: 'border-rose-600',
    4: 'border-rose-800',
}

// How much weight to give to voice vs text for the "intensity" calculation
// 1 minute of voice = 1 point
// 1 message = 0.2 points (so 5 messages = 1 minute of talking)
export const WEIGHTS = {
  VOICE_MULTIPLIER: 1,
  MESSAGE_MULTIPLIER: 0.2,
};

export const MOCK_DATA_COUNT = 365;
