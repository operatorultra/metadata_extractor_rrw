import { useEffect, useRef, useState } from "react";
import init, { Metadata } from "../pkg/metadata_extractor.js";
import "./App.css";

// Declare the type for the metadata object
type MetadataType = {
	make: string;
	model: string;
	flash_found: string;
	gps: string;
	altitude: string;
	description: string;
	copyright: string;
};

function App() {
	// State variables to store the metadata, image location, and image src
	const [metadata, setMetadata] = useState<MetadataType>();
	const [location, setLocation] = useState("");
	const [imageSrc, setImageSrc] = useState("");

	// Determine if the metadata object has GPS latitude and longitude data
	const HAS_GPS_LAT_LON = metadata?.gps && JSON.parse(metadata?.gps).length > 0;

	// Create a ref for the file input element
	const fileInput = useRef(null);

	// Handle the click event for the button
	const handleClick = () => {
		// Click the file input element when the button is clicked
		(fileInput.current! as HTMLElement).click();
	};

	// Handle the change event for the file input element
	const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		// Initialize the metadata extractor
		await init();

		// Get the selected file
		const { files } = event.target;

		if (files) {
			const file = files[0];
			// Create a URL for the file
			const fileURL = URL.createObjectURL(file);
			// Get the array buffer for the file
			const buffer = await file.arrayBuffer();
			// Create a view of the array buffer
			const vector = new Uint8Array(buffer);

			// Get the metadata for the file
			const metaData = Metadata.get_metadata(vector);

			// If metadata was extracted, update the metadata state
			if (metaData) setMetadata(metaData);

			// If a file URL was created, update the image src state
			if (fileURL) setImageSrc(fileURL);
		}
	};

	// Use an effect to update the location state when the metadata object's GPS data changes
	useEffect(() => {
		if (HAS_GPS_LAT_LON) {
			// Parse the GPS data from the metadata object
			const gps = JSON.parse(metadata?.gps)[0];
			// Split the latitude string into an array of numbers
			let lat: number[] = [];
			gps.latitude.split(" ").forEach((entry: string) => {
				const parsedEntry = parseFloat(entry);
				// Only add valid numbers to the array
				if (parsedEntry) {
					lat.push(parsedEntry);
				}
			});
			// Split the longitude string into an array of numbers
			let lon: number[] = [];
			gps.longitude.split(" ").forEach((entry: string) => {
				const parsedEntry = parseFloat(entry);
				// Only add valid numbers to the array
				if (parsedEntry) {
					lon.push(parsedEntry);
				}
			});

			// Create a Google Maps URL with the latitude and longitude data and update the location state
			setLocation(
				`https://maps.google.com/maps?q=${lat.join(" ")}, ${lon.join(
					" "
				)}&t=&z=12&ie=UTF8&iwloc=&output=embed`
			);
		}
	}, [metadata?.gps]);

	return (
		<div className="App">
			<h2>Select a file:</h2>
			<button onClick={handleClick}>Open File Dialog</button>
			<input
				type="file"
				ref={fileInput}
				onChange={handleChange}
				style={{ display: "none" }}
				multiple={false}
			/>

			{imageSrc.length > 0 && <img width="200" height="200" src={imageSrc} alt="thumb" />}
			<h2>Metadata:</h2>

			{metadata?.make && <div>Make: {metadata?.make}</div>}
			{metadata?.model && <div>Model: {metadata?.model}</div>}
			{metadata?.flash_found && <div>Flash: {metadata?.flash_found}</div>}
			{metadata?.altitude && <div>Altitude: {parseFloat(metadata?.altitude).toFixed(2)}</div>}
			{metadata?.description && <div>Description: {metadata?.description}</div>}
			{metadata?.copyright && <div>Copyright: {metadata?.copyright}</div>}

			{HAS_GPS_LAT_LON && (
				<>
					<h3>Photo taken at:</h3>
					<iframe width="500px" height="200px" src={location} />
				</>
			)}
		</div>
	);
}

export default App;
