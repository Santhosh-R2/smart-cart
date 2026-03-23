const BASE_URL = 'http://localhost:5000/api/products';

async function runTests() {
  try {
    console.log('--- Adding Product with Image File ---');
    
    // Create a dummy image buffer (a 1x1 pixel PNG)
    const dummyImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    
    // Create FormData for multipart/form-data request
    const formData = new FormData();
    formData.append('product_name', 'Blueberry');
    formData.append('price', '300');
    formData.append('discount', '15');
    formData.append('quantity', '250 g');
    formData.append('section', 'Section 1');
    formData.append('category', 'Fruits');
    
    // Append the buffer as a file
    const blob = new Blob([dummyImageBuffer], { type: 'image/png' });
    formData.append('image', blob, 'blueberry.png');

    try {
      const res = await fetch(`${BASE_URL}/add`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      console.log(`Status: ${res.status}`, JSON.stringify(data, null, 2));
    } catch (e) {
      console.log(`Failed to add product: ${e.message}`);
    }

    console.log('\n--- Viewing All Products ---');
    const allRes = await fetch(`${BASE_URL}/all`);
    const allData = await allRes.json();
    console.log(JSON.stringify(allData, null, 2));
  } catch (err) {
    console.error('Test Error:', err.message);
  }
}

runTests();
