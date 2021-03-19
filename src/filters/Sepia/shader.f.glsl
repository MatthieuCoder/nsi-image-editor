#version 300 es

#define MAX_KERNEL_SIZE 5

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

// our texture
uniform sampler2D u_image;

// the convolution kernel data
uniform float u_kernel[MAX_KERNEL_SIZE * MAX_KERNEL_SIZE];
uniform float u_kernelWeight;
uniform int   u_kernelSize;

uniform float u_colorMatrix[4 * 4];
uniform vec4 u_luminance;

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

// we need to declare an output for the fragment shader
out vec4 outColor;

vec4 applyConvolutionKernel(vec2 pixelLocation) {
    vec4 colorSum;
    vec2 base = pixelLocation * vec2(-(u_kernelSize / 2), -(u_kernelSize)/2);

    for (int i = 0; i < u_kernelSize; i++) {
        for (int j = 0; j < u_kernelSize; j++) {
            float kernelValue = u_kernel[j + i];
            vec2 coordinates = v_texCoord + base * vec2(i, j);
            colorSum += texture(u_image, coordinates) * kernelValue;
        }
    }

    return vec4((colorSum / u_kernelWeight).rgb, 1);
}

void main() {
    // Get the current value of the pixel.
    vec2 currentPixelLocation = vec2(1) / vec2(textureSize(u_image, 0));

    vec4 convolutedColor = applyConvolutionKernel(currentPixelLocation);

    outColor = vec4(
        dot(convolutedColor.rgba, vec4(u_colorMatrix[0], u_colorMatrix[1], u_colorMatrix[2],  u_colorMatrix[3])),
        dot(convolutedColor.rgba, vec4(u_colorMatrix[4], u_colorMatrix[5], u_colorMatrix[6],  u_colorMatrix[7])),
        dot(convolutedColor.rgba, vec4(u_colorMatrix[8], u_colorMatrix[9], u_colorMatrix[10], u_colorMatrix[11])),
        dot(convolutedColor.rgba, vec4(u_colorMatrix[12], u_colorMatrix[13], u_colorMatrix[14],  u_colorMatrix[15]))
    ) * vec4(u_luminance);
}