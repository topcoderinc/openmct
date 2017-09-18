/*****************************************************************************
 * Open MCT, Copyright (c) 2014-2017, United States Government
 * as represented by the Administrator of the National Aeronautics and Space
 * Administration. All rights reserved.
 *
 * Open MCT is licensed under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * Open MCT includes source code licensed under additional open source
 * licenses. See the Open Source Licenses file (LICENSES.md) included with
 * this source code distribution or the Licensing information page available
 * at runtime from the About dialog for additional information.
 *****************************************************************************/

define(
    ["../../src/controllers/EditObjectController"],
    function (EditObjectController) {

        describe("The Edit Object controller", function () {
            var mockScope,
                mockObject,
                testViews,
                mockEditorCapability,
                mockLocation,
                mockNavigationService,
                removeCheck,
                mockStatusCapability,
                mockCapabilities,
                controller;

            beforeEach(function () {
                mockScope = jasmine.createSpyObj(
                    "$scope",
                    ["$on", "$watch"]
                );
                mockObject = jasmine.createSpyObj(
                    "domainObject",
                    ["getId", "getModel", "getCapability", "hasCapability", "useCapability"]
                );
                mockEditorCapability = jasmine.createSpyObj(
                    "mockEditorCapability",
                    ["isEditContextRoot", "dirty", "finish"]
                );
                mockStatusCapability = jasmine.createSpyObj('statusCapability',
                    ["get"]
                );

                mockCapabilities = {
                    "editor" : mockEditorCapability,
                    "status": mockStatusCapability
                };

                mockLocation = jasmine.createSpyObj('$location',
                    ["search"]
                );
                mockLocation.search.andReturn({"view": "fixed"});
                mockNavigationService = jasmine.createSpyObj('navigationService',
                    ["checkBeforeNavigation"]
                );

                removeCheck = jasmine.createSpy('removeCheck');
                mockNavigationService.checkBeforeNavigation.andReturn(removeCheck);

                mockObject.getId.andReturn("test");
                mockObject.getModel.andReturn({ name: "Test object" });
                mockObject.getCapability.andCallFake(function (key) {
                    return mockCapabilities[key];
                });

                testViews = [
                    { key: 'abc' },
                    { key: 'def', someKey: 'some value' },
                    { key: 'xyz' }
                ];

                mockObject.useCapability.andCallFake(function (c) {
                    return (c === 'view') && testViews;
                });
                mockLocation.search.andReturn({ view: 'def' });

                mockScope.domainObject = mockObject;

                controller = new EditObjectController(
                    mockScope,
                    mockLocation,
                    mockNavigationService
                );
            });

            it("adds a check before navigation", function () {
                expect(mockNavigationService.checkBeforeNavigation)
                    .toHaveBeenCalledWith(jasmine.any(Function));

                var checkFn = mockNavigationService.checkBeforeNavigation.mostRecentCall.args[0];

                mockEditorCapability.isEditContextRoot.andReturn(false);
                mockEditorCapability.dirty.andReturn(false);

                expect(checkFn()).toBe(false);

                mockEditorCapability.isEditContextRoot.andReturn(true);
                expect(checkFn()).toBe(false);

                mockEditorCapability.dirty.andReturn(true);
                expect(checkFn())
                    .toBe("Continuing will cause the loss of any unsaved changes.");

            });

            it("cleans up on destroy", function () {
                expect(mockScope.$on)
                    .toHaveBeenCalledWith("$destroy", jasmine.any(Function));

                mockScope.$on.mostRecentCall.args[1]();

                expect(removeCheck).toHaveBeenCalled();
            });

            it("sets the active view from query parameters", function () {
                expect(mockScope.representation.selected)
                    .toEqual(testViews[1]);
            });

        });
    }
);
