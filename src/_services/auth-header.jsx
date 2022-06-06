
  export function authHeader () {
    // Set this to whatever the minimum token length should be (if you know)
    // Otherwise, you can leave at 1 for "not an empty string"
    const minTokenLength = 1;
  
    try {
      const userInfo = localStorage.getItem('user');
      // Abort if not string
      if (typeof userInfo !== 'string') throw new Error('User info not found');
  
      // Destructure token
      const {token} = JSON.parse(userInfo) ;
  
      // Abort if token is not string and min length
      if (!(typeof token === 'string' && token.length >= minTokenLength)) {
        throw new Error('Invalid user access token');
      }

      // Return headers object
      return { Authorization: 'Bearer ' + token};
    }
    catch {
      // Catch any errors and return an empty headers object
      return {};
    }
  }