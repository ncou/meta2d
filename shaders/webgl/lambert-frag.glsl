precision mediump float;

uniform vec3 objectColor;
uniform vec3 lightColor;

varying vec3 varNormal;
varying vec3 varFragmentPos;
varying vec3 varLightPos;

void main()
{
	vec3 materialAmbient = vec3(1.0, 0.5, 0.31);
	vec3 materialDiffuse = vec3(1.0, 0.5, 0.31);
	vec3 materialSpecular = vec3(0.5, 0.5, 0.5);

    // Ambient
    vec3 ambient = lightColor * materialAmbient;
  	
    // Diffuse 
    vec3 normal = normalize(varNormal);
    vec3 lightDir = normalize(varLightPos - varFragmentPos);
    float diffuseValue = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = lightColor * (diffuseValue * materialDiffuse);
    
    // Specular
    vec3 viewDir = normalize(-varFragmentPos);
    vec3 reflectDir = reflect(-lightDir, normal);  
    float specularValue = pow(max(dot(viewDir, reflectDir), 0.0), 10.0);
    vec3 specular = lightColor * (specularValue * materialSpecular);  
        
    vec3 result = diffuse + ambient + specular;
    gl_FragColor = vec4(result, 1.0);
}

// precision mediump float;

// struct Material {
// 	vec3 ambient;
// 	vec3 diffuse;
// 	vec3 specular;
// 	float shininess;
// };

// uniform Material material;
// uniform vec3 lightColor;

// varying vec3 varNormal;
// varying vec3 varFragmentPos;
// varying vec3 varLightPos;

// void main()
// {
//     vec3 ambient = lightColor * material.ambient;
  	
//     // Diffuse 
//     vec3 normal = normalize(varNormal);
//     vec3 lightDir = normalize(varLightPos - varFragmentPos);
//     float diffuseValue = max(dot(normal, lightDir), 0.0);
//     vec3 diffuse = lightColor * (diffuseValue * material.diffuse);
    
//     // Specular
//     float specularStrength = 0.5;
//     vec3 viewDir = normalize(-varFragmentPos);
//     vec3 reflectDir = reflect(-lightDir, normal);  
//     float specularValue = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
//     vec3 specular = lightColor * (specularValue * material.specular);  
        
//     vec3 result = diffuse + ambient + specular;
//     gl_FragColor = vec4(result, 1.0);
// }