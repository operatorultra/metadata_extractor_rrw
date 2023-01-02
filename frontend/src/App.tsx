import { useEffect, useRef, useState } from "react";
import init, { Metadata } from "../pkg/metadata_extractor.js";
import "./App.css";

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
	const [metadata, setMetadata] = useState<MetadataType>();
	const [location, setLocation] = useState("");
	const [imageSrc, setImageSrc] = useState("");
	const HAS_GPS_LAT_LON = metadata?.gps && JSON.parse(metadata?.gps).length > 0;
	console.log(imageSrc);

	const fileInput = useRef(null);

	const handleClick = () => {
		(fileInput.current! as HTMLElement).click();
	};

	const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		await init();
		const { files } = event.target;

		if (files) {
			const file = files[0];
			const fileURL = URL.createObjectURL(file);
			const buffer = await file.arrayBuffer();
			const view = new Uint8Array(buffer);

			const metaData = Metadata.get_metadata(view, file.type);

			if (metaData) setMetadata(metaData);

			if (fileURL) setImageSrc(fileURL);
		}
	};

	useEffect(() => {
		if (HAS_GPS_LAT_LON) {
			const gps = JSON.parse(metadata?.gps)[0];
			let lat: number[] = [];
			gps.latitude.split(" ").forEach((entry: string) => {
				const parsedEntry = parseFloat(entry);
				if (parsedEntry) {
					lat.push(parsedEntry);
				}
			});
			let lon: number[] = [];
			gps.longitude.split(" ").forEach((entry: string) => {
				const parsedEntry = parseFloat(entry);
				if (parsedEntry) {
					lon.push(parsedEntry);
				}
			});

			setLocation(
				`https://maps.google.com/maps?q=${lat.join(" ")}, ${lon.join(
					" "
				)}&t=&z=12&ie=UTF8&iwloc=&output=embed`
			);
		}
	}, [metadata?.gps]);

	return (
		<div className="App">
			<h2>Get a file</h2>
			<div>
				<button onClick={handleClick}>Open File Dialog</button>
				<input
					type="file"
					ref={fileInput}
					onChange={handleChange}
					style={{ display: "none" }}
					multiple={false}
				/>
			</div>
			{imageSrc.length > 0 && <img width="200" height="200" src={imageSrc} alt="thumb" />}
			<h2>Metadata:</h2>
			{metadata?.make && <div>Make: {metadata?.make}</div>}
			{metadata?.model && <div>Model: {metadata?.model}</div>}
			{metadata?.flash_found && <div>Flash: {metadata?.flash_found}</div>}
			{metadata?.altitude && (
				<div>
					Altitude: {parseFloat(metadata?.altitude).toFixed(2)} meters above sealevel
				</div>
			)}
			{HAS_GPS_LAT_LON && (
				<>
					<h3>Photo taken at:</h3>
					<iframe width="500px" height="200px" src={location} />
				</>
			)}
			{metadata?.description && <div>Image description: {metadata?.description}</div>}
			{metadata?.copyright && <div>Copyright: {metadata?.copyright}</div>}
		</div>
	);
}

export default App;
