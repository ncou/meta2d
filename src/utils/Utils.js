
function isSpace(c) {
	return (c === " " || c === "\t" || c === "\r" || c === "\n");
}

function isNewline(c) {
	return (c === "\r" || c === "\n");
}

function isDigit(c) {
	return (c >= "0" && c <= "9") || (c === ".") || (c === "-") || (c === "+");
}

function isAlpha(c)
{
	return (c >= "a" && c <= "z") ||
		(c >= "A" && c <= "Z") ||
		(c == "_" && c <= "$");
}

function isAlphaNum(c)
{
	return (c >= "a" && c <= "z") ||
		(c >= "A" && c <= "Z") ||
		(c >= "0" && c <= "9") ||
		c === "_" || c === "$";
}

export default { 
	isSpace, 
	isNewline,
	isDigit,
	isAlpha,
	isAlphaNum
}