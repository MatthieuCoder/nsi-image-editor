#version 300 es

#define MAX_KERNEL_SIZE 5

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

// our texture
uniform sampler2D u_image;
uniform float u_force;

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
    vec4 color = texture(u_image, v_texCoord);
    vec4 sepiaColor;
    sepiaColor.r = dot(color.rgb, vec3(0.3588, 0.7044, 0.1368));
    sepiaColor.g = dot(color.rgb, vec3(0.2990, 0.5870, 0.1140));
    sepiaColor.b = dot(color.rgb, vec3(0.2392, 0.4696, 0.0912));

    outColor = (u_force * sepiaColor) + ((1.0 - u_force) * color);
}