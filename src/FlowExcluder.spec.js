const { FlowExcluder } = require("./FlowExcluder");

describe("FlowExcluder", () => {
  const excluder = FlowExcluder([
    ["first", "second", "third"],
    ["fourth", "fifth"],
    ["sixth", "second"],
  ]);

  excluder.setViewed("fourth");
  excluder.setViewed("sixth");

  test("excluder works as expected", () => {
    expect(excluder.isExcluded("first")).toBeFalsy();
    expect(excluder.isExcluded("second")).toBeTruthy();
    expect(excluder.isExcluded("third")).toBeFalsy();
    expect(excluder.isExcluded("fourth")).toBeTruthy();
    expect(excluder.isExcluded("fifth")).toBeTruthy();
    expect(excluder.isExcluded("sixth")).toBeTruthy();
    expect(excluder.isExcluded("seventh")).toBeFalsy();
  });
});
