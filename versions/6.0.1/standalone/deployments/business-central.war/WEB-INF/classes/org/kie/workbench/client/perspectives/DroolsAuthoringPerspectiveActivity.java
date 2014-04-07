/*
 * Copyright 2012 JBoss Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.kie.workbench.client.perspectives;

import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import javax.annotation.Generated;
import javax.enterprise.context.Dependent;
import javax.inject.Inject;

import javax.inject.Named;
import org.uberfire.workbench.model.PerspectiveDefinition;
import org.uberfire.client.mvp.AbstractWorkbenchPerspectiveActivity;
import org.uberfire.client.mvp.PlaceManager;

import org.uberfire.mvp.PlaceRequest;

import org.uberfire.workbench.model.menu.Menus;

import org.uberfire.workbench.model.toolbar.ToolBar;

@Dependent
@Generated("org.uberfire.annotations.processors.WorkbenchPerspectiveProcessor")
@Named("org.kie.workbench.client.perspectives.DroolsAuthoringPerspective")
/*
 * WARNING! This class is generated. Do not modify.
 */
public class DroolsAuthoringPerspectiveActivity extends AbstractWorkbenchPerspectiveActivity {

    private static final Collection<String> ROLES = Collections.emptyList();

    private static final Collection<String> TRAITS = Collections.emptyList();

    @Inject
    private DroolsAuthoringPerspective realPresenter;

    @Inject
    //Constructor injection for testing
    public DroolsAuthoringPerspectiveActivity(final PlaceManager placeManager) {
        super( placeManager );
    }

    @Override
    public String getIdentifier() {
        return "org.kie.workbench.client.perspectives.DroolsAuthoringPerspective";
    }

    @Override
    public PerspectiveDefinition getPerspective() {
        return realPresenter.getPerspective();
    }

    @Override
    public Menus getMenus() {
        return realPresenter.getMenus();
    }

    @Override
    public ToolBar getToolBar() {
        return realPresenter.getToolBar();
    }

    @Override
    public Collection<String> getRoles() {
        return ROLES;
    }

    @Override
    public Collection<String> getTraits() {
        return TRAITS;
    }

    @Override
    public String getSignatureId() {
        return "org.kie.workbench.client.perspectives.DroolsAuthoringPerspectiveActivity";
    }
}
