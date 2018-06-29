import { h, app } from "hyperapp";

import TreeNode from "./components/TreeNode.js";
import actions from "./actions.js";

export const normalize = (nodes, nodesCount) => {
  let id, node;
  let stack = nodes;
  let normalizedTree = {};

  stack.forEach((node, index) => {
    node.parentId = "root";
    node.index = index + 1;
    node.id = "ht-node-" + nodesCount++;
    stack.forEach((siblingNode, siblingIndex) => {
      if (!Array.isArray(siblingNode.siblingsIds)) siblingNode.siblingsIds = [];

      if (siblingIndex !== index) {
        siblingNode.siblingsIds.push(node.id);
      }
    });
  });

  while (stack.length > 0) {
    node = stack.shift();
    id = node.id;

    /* defaults */
    node.isExpand = true;
    /* EO defaults */

    if (Array.isArray(node.children)) {
      node.children.forEach((subnode, index) => {
        subnode.id = "ht-node-" + nodesCount++;
        subnode.parentId = id;
        subnode.index = index + 1;
        if (!Array.isArray(node.childrenIds)) node.childrenIds = [];
        node.childrenIds.push(subnode.id);

        node.children.forEach((siblingNode, siblingIndex) => {
          if (!Array.isArray(siblingNode.siblingsIds))
            siblingNode.siblingsIds = [];

          if (siblingIndex !== index) {
            siblingNode.siblingsIds.push(subnode.id);
          }
        });

        stack.push(subnode);
      });

      delete node.children;
    } else {
      node.childrenIds = [];
    }

    normalizedTree[id] = node;
  }

  return normalizedTree;
};

export const generateMarkup = (normalizedTree, toggleExpandCollapse) => {
  let stack = [];
  let markup = [];
  let nodeMarkup, nodeConfig, childConfig, childMarkup;

  for (let nodeId in normalizedTree) {
    nodeConfig = normalizedTree[nodeId];
    if (nodeConfig.parentId === "root") {
      nodeMarkup = (
        <TreeNode
          config={nodeConfig}
          toggleExpandCollapse={toggleExpandCollapse}
        />
      );
      stack.push(nodeMarkup);
      markup.push(nodeMarkup);
    }
  }

  while (stack.length > 0) {
    nodeMarkup = stack.shift();
    nodeConfig = normalizedTree[nodeMarkup.attributes.key];

    if (nodeConfig.childrenIds.length !== 0) {
      nodeConfig.childrenIds.forEach(childId => {
        childConfig = normalizedTree[childId];
        childMarkup = (
          <TreeNode
            config={childConfig}
            toggleExpandCollapse={toggleExpandCollapse}
          />
        );
        nodeMarkup.children[1].children.push(childMarkup); //bad code

        if (childConfig.childrenIds.length !== 0) stack.push(childMarkup);
      });
    }
  }

  return markup;
};

export const view = (state, actions) => {
  let markup = generateMarkup(state.nodes, actions.toggleExpandCollapse);

  return (
    <div>
      <h1>{state.title}</h1>
      {markup}
    </div>
  );
};

export const render = config => {
  const state = {
    title: config.title,
    actionHandlers: {},
    nodes: normalize(config.nodes, 1)
  };

  const wiredActions = app(state, actions, view, document.body);

  return {
    ...wiredActions
  };
};
