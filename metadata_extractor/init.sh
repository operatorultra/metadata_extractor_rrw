cargo install wasm-pack
cargo build
rm -rf ../frontend/pkg
wasm-pack build --target web

mv pkg ../frontend
