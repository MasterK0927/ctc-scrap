const fs = require('fs');

// Function to parse CSV and filter rows with 4 or fewer fields
function filterCSV(inputFile, outputFile) {
  console.log(`Reading from: ${inputFile}`);
  console.log(`Writing to: ${outputFile}`);

  // Read the entire CSV file
  fs.readFile(inputFile, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file: ${err}`);
      return;
    }

    // Split the file into lines
    const lines = data.split('\n');

    // Filter lines with 4 or fewer fields
    const filteredLines = lines.filter((line) => {
      const fields = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      return fields.length <= 4;
    });

    // Join the filtered lines back into a single string
    const filteredData = filteredLines.join('\n');

    // Write the filtered data to the output file
    fs.writeFile(outputFile, filteredData, 'utf8', (err) => {
      if (err) {
        console.error(`Error writing file: ${err}`);
        return;
      }
      console.log(`Filtering complete. Data saved to ${outputFile}`);
    });
  });
}

// Specify the input and output file paths
const inputFile = '../scraper/scraped_data.csv';
const outputFile = '../filtered_data.csv';

// Run the filter function
filterCSV(inputFile, outputFile);
