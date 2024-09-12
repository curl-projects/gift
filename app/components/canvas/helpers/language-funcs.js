export const englishToLepchaMap = {
    'a': 'ᰀ', 'b': 'ᰁ', 'c': 'ᰂ', 'd': 'ᰃ', 'e': 'ᰄ', 'f': 'ᰅ', 'g': 'ᰆ', 'h': 'ᰇ',
    'i': 'ᰈ', 'j': 'ᰉ', 'k': 'ᰊ', 'l': 'ᰋ', 'm': 'ᰌ', 'n': 'ᰍ', 'o': 'ᰎ', 'p': 'ᰏ',
    'q': 'ᰐ', 'r': 'ᰑ', 's': 'ᰒ', 't': 'ᰓ', 'u': 'ᰔ', 'v': 'ᰕ', 'w': 'ᰖ', 'x': 'ᰗ',
    'y': 'ᰘ', 'z': 'ᰙ',
    'A': 'ᰀ', 'B': 'ᰁ', 'C': 'ᰂ', 'D': 'ᰃ', 'E': 'ᰄ', 'F': 'ᰅ', 'G': 'ᰆ', 'H': 'ᰇ',
    'I': 'ᰈ', 'J': 'ᰉ', 'K': 'ᰊ', 'L': 'ᰋ', 'M': 'ᰌ', 'N': 'ᰍ', 'O': 'ᰎ', 'P': 'ᰏ',
    'Q': 'ᰐ', 'R': 'ᰑ', 'S': 'ᰒ', 'T': 'ᰓ', 'U': 'ᰔ', 'V': 'ᰕ', 'W': 'ᰖ', 'X': 'ᰗ',
    'Y': 'ᰘ', 'Z': 'ᰙ'
};

export function transliterateToLepcha(text) {
    return text.split('').map(char => englishToLepchaMap[char] || char).join('');
}

export function getRandomLepchaCharacter() {
    const lepchaCharacters = Object.values(englishToLepchaMap);
    const randomIndex = Math.floor(Math.random() * lepchaCharacters.length);
    return lepchaCharacters[randomIndex];
}
