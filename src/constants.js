export const CATEGORY_HUES = {
    red: '#FBCFE8',      // Pastel Pink 200
    princess: '#FBCFE8', // Pastel Pink 200
    cyan: '#BAE6FD',     // Pastel Sky 200
    blue: '#BAE6FD',     // Pastel Blue 200
    emerald: '#BBF7D0',  // Pastel Green 200
    mint: '#BBF7D0',     // Pastel Green 200
    green: '#BBF7D0',    // Pastel Green 200
    yellow: '#FDE68A',   // Pastel Amber 200
    purple: '#E9D5FF'    // Pastel Purple 200
};

export const CATEGORY_ICON_HUES = {
    red: '#FB7185',      // Rose 400
    princess: '#FB7185', // Rose 400
    cyan: '#38BDF8',     // Sky 400
    blue: '#38BDF8',     // Sky 400
    emerald: '#4ADE80',  // Green 400
    mint: '#4ADE80',     // Green 400
    green: '#4ADE80',    // Green 400
    yellow: '#FBBF24',   // Amber 400
    purple: '#C084FC'    // Purple 400
};

export const hexToRgba = (hex, alpha) => {
    if (!hex) return 'rgba(0,0,0,0)';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
