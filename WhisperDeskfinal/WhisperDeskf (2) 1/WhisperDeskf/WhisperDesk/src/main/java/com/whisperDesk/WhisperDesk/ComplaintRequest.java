package com.whisperDesk.WhisperDesk;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ComplaintRequest {
    private String description;
    private String departmentName;
    
    @JsonProperty("private")
    private boolean isPrivate;

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    @JsonProperty("private")
    public boolean isPrivate() {
        return isPrivate;
    }

    @JsonProperty("private")
    public void setPrivate(boolean isPrivate) {
        this.isPrivate = isPrivate;
    }
}
