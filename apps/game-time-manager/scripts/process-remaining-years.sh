#!/bin/bash

# Process remaining years
years="2017 2018 2019 2020 2022 2023 2024"

for year in $years; do
    echo "========================================="
    echo "Processing year $year..."
    echo "========================================="
    
    # Download images for this year
    node scripts/download-single-year.js $year
    
    # Update markdown to use local paths
    node scripts/update-markdown-local-images.js $year
    
    echo "Completed year $year"
    echo ""
done

echo "All years processed!"