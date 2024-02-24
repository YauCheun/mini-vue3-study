
import { baseParse } from "./parse";
import { transform } from "./transform";
import { transformExpression } from "./transforms/transfomExpression";
import { transformElement } from "./transforms/transformElement";
import { transformText } from "./transforms/transformText";

export function baseCompile(template: string) {
  // 1.先把 template parse 成 ast 
  const ast: any = baseParse(template)
  console.log(ast)
  // 2.给ast树添加属性
  transform(ast, {
    nodeTransforms: [transformExpression, transformElement, transformText],
  });
  console.log(ast)
  // 3.转成render函数
}
// baseCompile('<img />')             
baseCompile('<div :test="test" class="test"><p style=""></p>{{message}}</div>')             