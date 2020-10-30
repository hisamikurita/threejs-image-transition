precision mediump float;

uniform vec2 u_meshsize;
uniform vec2 u_texturesize;
uniform sampler2D u_texture_01;
uniform sampler2D u_texture_02;
uniform sampler2D u_noise_texture;
uniform float imageDistLevel;
uniform float noiseLevel;

varying vec2 vUv;

#define PI 3.14159265359

mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}

void main() {
    // メッシュとテクスチャ(画像)の解像度を比較して縦横の辺どちらを余らせることでメッシュにフィットするようになるのかを計算する
    vec2 ratio = vec2(
        min((u_meshsize.x / u_meshsize.y) / (u_texturesize.x / u_texturesize.y), 1.0),
        min((u_meshsize.y / u_meshsize.x) / (u_texturesize.y / u_texturesize.x), 1.0)
    );
    vec2 uv = vec2(
        vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
        vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );

    vec4 noiseTexture = texture2D(u_noise_texture, uv);

    vec2 calcPosition = uv + vec2(noiseTexture.r, noiseTexture.g) * noiseLevel;
    vec4 texture_1 = texture2D(u_texture_01, calcPosition);
    vec4 texture_2 = texture2D(u_texture_02, calcPosition);

    vec4 finalTexture = mix(texture_1, texture_2, imageDistLevel);
    gl_FragColor = finalTexture;
}