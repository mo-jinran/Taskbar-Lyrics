cmake_minimum_required(VERSION 3.30)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

add_compile_options(/utf-8 /D_UNICODE /DUNICODE)

project(native LANGUAGES CXX)

add_library(native SHARED
    "src/DllMain.cpp"
    "src/plugin/Plugin.cppm"
    "src/plugin/Config.cppm"
    "src/plugin/Receiver.cppm"
    "src/taskbar/Taskbar.cppm"
    "src/taskbar/Handler.cppm"
    "src/taskbar/Registry.cppm"
    "src/window/Window.cppm"
    "src/window/Renderer.cppm"
    "src/window/Lyrics.cppm"
)

target_link_libraries(native PRIVATE d3d11)
target_link_libraries(native PRIVATE d2d1)
target_link_libraries(native PRIVATE dwrite)
target_link_libraries(native PRIVATE dxgi)
target_link_libraries(native PRIVATE dcomp)
