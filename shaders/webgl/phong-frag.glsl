precision mediump float;

uniform sampler2D albedo;
uniform sampler2D specular;
uniform sampler2D emission;
uniform vec3 lightColor;

varying vec2 varUV;
varying vec3 varNormal;
varying vec3 varFragmentPos;
varying vec3 varLightPos;

#define PI 3.1415926

void main()
{
    float shininess = 10.0;
    vec3 lightAmbient = vec3(0.2, 0.2, 0.2);
    vec3 lightDiffuse = vec3(1.0);
    vec3 lightSpecular = vec3(1.0, 1.0, 1.0);
    vec4 albedoDiffuse = texture2D(albedo, varUV);
    vec4 specularDiffuse = texture2D(specular, varUV);
    specularDiffuse = vec4(1.0);
    albedoDiffuse = vec4(1.0);

    vec3 ambient = lightAmbient * albedoDiffuse.xyz;

    // Diffuse 
    vec3 normal = normalize(varNormal);
    vec3 lightDir = normalize(varLightPos - varFragmentPos);
    float diffuseValue = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = albedoDiffuse.xyz * lightDiffuse * diffuseValue;
    
    // Specular
    float energyConservation = (8.0 + shininess) / (8.0 * PI); 
    vec3 viewDir = normalize(-varFragmentPos);
    vec3 halfwayDir = normalize(lightDir + viewDir);
    float specularValue = energyConservation * pow(max(dot(normal, halfwayDir), 0.0), shininess);
    vec3 specularColor = lightSpecular * specularValue * vec3(specularDiffuse); 
  	    
    // vec3 emissionColor = vec3(texture2D(emission, varUV));
    vec3 emissionColor = vec3(0.0);

    gl_FragColor = vec4(ambient + clamp(diffuse + specularColor, 0.0, 1.0) + emissionColor, 1.0);
}