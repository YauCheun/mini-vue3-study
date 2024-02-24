/*
 * @Author: YauCheun 1272125039@qq.com
 * @Date: 2024-02-24 16:18:26
 * @LastEditors: YauCheun 1272125039@qq.com
 * @LastEditTime: 2024-02-24 17:10:20
 * @FilePath: \mini-vue3-study\src\compiler-core\src\transform.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { NodeTypes } from "./ast";
import { TO_DISPLAY_STRING } from "./runtimeHelpers";

export function transform(root, options = {}) {
  // 生成转换上下文
  const context = createTransformContext(root, options);
  // 遍历AST节点进行转换
  traverseNode(root, context);
  // 创建根节点
  createRootCodegen(root);
  // 将上下文的helper里面用到的额外字符串的键挂载到 原AST
  // [ 类似于挂载全局string ] 取的时候 obj["string"]
  root.helpers = [...context.helpers.keys()];
}

function createRootCodegen(root: any) {
  const child = root.children[0];
  if (child.type === NodeTypes.ELEMENT) {
    root.codegenNode = child.codegenNode;
  } else {
    root.codegenNode = root.children[0];
  }
}

function traverseNode(node: any, context: any) {
  if (!node) return;
  // 从上下文中取出转换方法
  const transforms = context.nodeTransforms;
  // 退出函数数组
  const exitFns: any = [];
  // 遍历转换方法数组，并维护退出函数数组
  for (let i = 0; i < transforms.length; i++) {
    const onExit = transforms[i](node, context);
    if (onExit) exitFns.push(onExit);
  }

  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      // context的helper中添加TO_DISPLAY_STRING辅助函数
      context.helper(TO_DISPLAY_STRING);
      break;
    case NodeTypes.ROOT:
        // 遍历子节点
    case NodeTypes.ELEMENT:
         // 遍历子节点
      traverseChildren(node, context);
      break;

    default:
      break;
  }

  let i = exitFns.length;
  while (i--) {
    exitFns[i]();
  }
}

function traverseChildren(node: any, context: any) {
  const children = node.children;
  for (let i = 0; i < children.length; i++) {
    traverseNode(children[i], context);
  }
}

function createTransformContext(root: any, options: any): any {
  const context = {
    // options

    // state
    root,
    helpers: new Map(),
    nodeTransforms: options.nodeTransforms || [],
    // methods
    helper(key) {
      context.helpers.set(key, 1);
    },
  };
  return context;
}
