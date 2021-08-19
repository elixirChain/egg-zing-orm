import { upperCamelize, isValid } from "./string";

/**
 * modifyValues
 * @param _obj 参数
 * @param _fn 参数
 */
export function modifyValues(_obj: any, _fn: (arg0: any) => any) {
  return batch(_obj, (_acc: any, _cur: any[]) => {
    if (_cur[1]) {
      _acc[_cur[0]] = _fn(_cur[1]);
    }
  });
}

/**
 * batch
 * @param _obj 参数
 * @param _fn 参数
 */
export function batch(_obj: any, _fn: any) {
  return Object.entries(_obj).reduce((_acc, _cur) => {
    _fn(_acc, _cur);
    return _acc;
  }, {});
}

/**
 * 判断空对象
 * - null, undefined 或者 {}
 * - 没有一个合法属性(allFlag: false/undefined) 或 有一个非法属性(allFlag: true)
 * @param obj 参数
 * @param allFlag 判断属性标志
 * @returns boolean
 */
export function isEmptyObject(obj: any, allFlag?: boolean) {
  if (!obj || Object.keys(obj).length === 0) {
    return true;
  }
  if (!allFlag) {
    // 没有一个合法属性
    return Object.keys(obj).findIndex(r => isValid(obj[r])) === -1;
  }
  // 有一个非法属性
  return Object.keys(obj).findIndex(r => !isValid(obj[r])) !== -1;
}

/**
 * 判断空数组
 * - null, undefined 或者 空数组,
 * - 数据元素全部为非法;
 * @param arr 数组对象
 * @returns boolean
 */
export function isEmptyArray(arr: any) {
  if (!arr || arr.length === 0 || arr.every((el: any) => !isValid(el))) {
    return true;
  }
  return false;
}

/**
 * 对象数组 转 指定属性的值的数组
 * @param arrayList 对象数组 [{}]
 * @param key 对象属性
 * @returns array
 */
export function getValuesByKey(arrayList: any[], key: string) {
  if (!arrayList) {
    return [];
  }
  const values = [];
  for (let i = 0; i < arrayList.length; i++) {
    if (!!arrayList[i]) {
      values.push(arrayList[i][key]);
    }
  }
  return values;
}

/**
 * 对象数组 转 指定属性的值的 map
 * @param arrayList 对象数组 [{}]
 * @param key 对象属性
 * @returns object
 */
export function getMapByKey(arrayList: any[], key: string | number) {
  if (!arrayList) {
    return {};
  }
  const map = {};
  for (let i = 0; i < arrayList.length; i++) {
    if (!!arrayList[i]) {
      map[arrayList[i][key]] = arrayList[i];
    }
  }
  return map;
}

/**
 * 转换list[{parent_[attr], [attr]}] 为 树结构数据
 * @param dataList 边表节点数组
 * @param rootAttrValue 根节点（如果未指定则返回分类列表）
 * @param attr 属性值，默认 id
 * @returns any
 */
export function convertListToTree(dataList: any[], rootAttrValue: string | number, attr?: string) {
  let parent = 'parentId';
  let child = 'id';
  if (!!attr) {
    parent = 'parent' + upperCamelize(attr);
    child = attr;
  }

  // 转换数据
  let rootData: any;
  // 按 parent_[attr] 分组
  const parentMap = {};
  dataList && dataList.forEach(r => {
    // 获取父节点
    if (r[child] === rootAttrValue) {
      rootData = r;
    }

    if (!parentMap[r[parent]]) {
      parentMap[r[parent]] = [];
    }
    parentMap[r[parent]].push(r);
  });

  // 处理关联关系（由于是引用，则只需要遍历一遍关联即可）
  for (const p in parentMap) {
    parentMap[p] && parentMap[p].forEach((r: any) => {
      r.children = parentMap[r[child]];
    });
  }

  // 以父节点为基础汇总数据
  const rootList = parentMap[rootAttrValue];
  if (!rootList) {
    return dataList;
  }

  // 没有父节点，则响应首层列表（parentAttr = rootAttr）
  if (!rootData) {
    return rootList;
  }
  // 匹配父节点，则响应父节点（含下层节点，children）
  rootData.children = rootList;
  return rootData;
}
