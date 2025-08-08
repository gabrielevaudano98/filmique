package com.filmique.cameraxpro;

import com.getcapacitor.Logger;

public class CameraXProPlugin {

    public String echo(String value) {
        Logger.info("Echo", value);
        return value;
    }
}
