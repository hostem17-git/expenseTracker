// Normalize a string by removing spaces and converting to lowercase
export const normalizeName = (name) => name.trim().replace(/\s+/g, ' ').toLowerCase()


// Extract numeric value from a string
export const extractAmount = (str) => {
    const match = str.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
};

export const extractPhoneNumber = (text) => {                            
    const match = text.match(/\+?\d{1,3}\s?\d{10}/);             
    return match ? match[0] : null;                              
};