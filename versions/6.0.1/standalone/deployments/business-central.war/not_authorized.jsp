<%
    request.getSession().invalidate();
%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <link rel="stylesheet" href="<%=request.getContextPath()%>/styles/base.css">
    <link rel="stylesheet" href="<%=request.getContextPath()%>/styles/forms.css">
    <link rel="stylesheet" href="<%=request.getContextPath()%>/styles/login-screen.css">
    <link rel="shortcut icon"  href="<%=request.getContextPath()%>/favicon.ico" />
    <title>Red Hat JBoss BPM Suite :: Business central</title>
</head>
<body id="login">
<div id="rcue-login-screen">
    <img id="logo" src="<%=request.getContextPath()%>/images/login-screen-logo.png" alt="Red Hat Logo">

    <div id="login-wrapper" class="png_bg">

        <div id="login-top">
            <%--<img src="<%=request.getContextPath()%>/images/kie-ide.png" alt="KIE IDE Logo" title="Powered By Drools/jBPM"/>--%>
        </div>

        <div id="login-content" class="png_bg">
            <form action="<%=request.getContextPath()%>/org.kie.workbench.KIEWebapp/KIEWebapp.html" method="GET">
                <fieldset>
                    <legend><img src="<%=request.getContextPath()%>/images/RH_JBoss_BPMS_Logo.png" alt="RED HAT JBOSS BPM SUITE" title="RED HAT JBOSS BPM SUITE"/></legend>

                    <h3>Login failed: Not Authorized</h3>
                    <p>
                        <input class="button login" type="submit" value="Login as another user"/>
                    </p>
                </fieldset>

            </form>
        </div>
    </div>
</div>
</body>
</html>