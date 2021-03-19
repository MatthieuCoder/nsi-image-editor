#version 300 es

#define MAX_KERNEL_SIZE 5

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

// our texture
uniform sampler2D u_image;

uniform vec4 u_luminance;

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
    vec4 color = texture(u_image, v_texCoord);
    outColor = color * u_luminance;
}