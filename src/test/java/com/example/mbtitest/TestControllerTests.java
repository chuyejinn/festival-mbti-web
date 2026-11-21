package com.example.mbtitest;

import com.example.mbtitest.Controller.TestController;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

@WebMvcTest(TestController.class)
class TestControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @ParameterizedTest
    @CsvSource({"/, index", "/question, question", "/result, result"})
    void servesExpectedView(String path, String template) throws Exception {
        mockMvc.perform(get(path))
                .andExpect(status().isOk())
                .andExpect(view().name(template));
    }
}
