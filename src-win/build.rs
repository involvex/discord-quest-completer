fn main() {
    println!("cargo:rerun-if-changed=src/main.cpp");

    let target = std::env::var("TARGET").unwrap();
    if target.contains("windows") {
        let out_dir = std::env::var("OUT_DIR").unwrap();

        // Compile C++ to static library
        cc::Build::new()
            .cpp(true)
            .file("src/main.cpp")
            .flag("/GS-")
            .flag("/O1")
            .compile("runner_cpp");

        // Link the static library directly with full path
        let lib_path = format!("{}\\runner_cpp.lib", out_dir);
        println!("cargo:rustc-link-arg={}", lib_path);
        println!("cargo:rustc-link-arg=/NODEFAULTLIB");
        // Use our Rust main as entry point
        println!("cargo:rustc-link-arg=/ENTRY:main");
        println!("cargo:rustc-link-arg=/SUBSYSTEM:WINDOWS");
        println!("cargo:rustc-link-arg=/ALIGN:16");
        println!("cargo:rustc-link-arg=/FILEALIGN:16");
        println!("cargo:rustc-link-arg=/OPT:NOREF");

        println!("cargo:rustc-link-lib=kernel32");
        println!("cargo:rustc-link-lib=user32");
        println!("cargo:rustc-link-lib=shell32");
        println!("cargo:rustc-link-lib=gdi32");
    }
}
