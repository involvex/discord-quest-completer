// Rust entry point that calls C++ mainEntryPoint
#![no_std]
#![no_main]

extern "C" {
    fn mainEntryPoint();
}

#[no_mangle]
pub extern "C" fn main() {
    unsafe {
        mainEntryPoint();
    }
}

#[cfg(not(test))]
#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
    loop {}
}
